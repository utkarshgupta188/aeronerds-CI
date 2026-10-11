import os
import re
from typing import List

from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

load_dotenv()

_MODEL = "gpt-oss-120b"

_AMENDMENT_2026 = (
    "IMPORTANT — 28 August 2026 amendment to Rule 2(5)(c): "
    "Plots up to 500 sq m that conform to the Development Plan are now EXEMPT from "
    "obtaining a separate T&CP development permission before building sanction. "
    "State this explicitly when the question is about development permission for small plots."
)

_SYSTEM_EN = f"""You are a building-rules assistant for Bhopal Municipal Corporation clerks.
Answer questions using ONLY the rule text provided below.
If the provided rules do not contain the answer, respond with exactly the word NOT_FOUND and nothing else.
The retrieved rules may be only loosely related. If they do not actually state the answer (for example property tax payment or market land rates), reply NOT_FOUND. Never infer or invent a rule.
Rules are consolidated to 6 March 2025. Never give legal advice. Always state the rule number(s) you used.
Format your answer in clear sections using this structure:
**Answer:** [direct answer in 1-2 sentences]
**Key Points:**
- [bullet point 1]
- [bullet point 2]
**Rule Reference:** Rule [number] — [title]
**Note:** Based on rules consolidated to 6 March 2025. The clerk decides.

{_AMENDMENT_2026}"""

_SYSTEM_HI = f"""आप भोपाल नगर पालिका निगम के क्लर्क के लिए एक भवन-नियम सहायक हैं।
नीचे दिए गए नियम पाठ का उपयोग करके ही प्रश्नों का उत्तर दें।
यदि दिए गए नियमों में उत्तर नहीं है, तो केवल NOT_FOUND लिखें। मिले हुए नियम केवल मिलते-जुलते हो सकते हैं; यदि उनमें उत्तर स्पष्ट नहीं लिखा है (जैसे संपत्ति कर भुगतान, जमीन का बाजार भाव), तो NOT_FOUND लिखें। कभी भी नियम न गढ़ें।
नियम 6 मार्च 2025 तक के हैं। कानूनी सलाह न दें। हमेशा नियम संख्या बताएं।
उत्तर इस format में दें:
**उत्तर:** [सीधा जवाब 1-2 वाक्यों में]
**मुख्य बिंदु:**
- [बिंदु 1]
- [बिंदु 2]
**नियम संदर्भ:** नियम [संख्या] — [शीर्षक]
**नोट:** नियम 6 मार्च 2025 तक के हैं। अंतिम निर्णय क्लर्क का है।

महत्वपूर्ण — 28 अगस्त 2026 संशोधन, नियम 2(5)(ग): 500 वर्ग मीटर तक के भूखंड जो विकास योजना के अनुरूप हैं, उन्हें भवन स्वीकृति से पहले अलग T&CP विकास अनुमति लेने से छूट मिली है।"""

_SYSTEM_HINGLISH = f"""You are a building-rules assistant for Bhopal Municipal Corporation clerks.
Answer questions using ONLY the rule text provided below.
If the provided rules do not contain the answer, respond with exactly the word NOT_FOUND and nothing else.
The retrieved rules may be only loosely related. If they do not actually state the answer (for example property tax payment or market land rates), reply NOT_FOUND. Never infer or invent a rule.
The user is asking in Hinglish (Hindi-English mix). Reply in Hinglish — use simple Hindi words mixed with English terms for technical/legal words.
Rules are consolidated to 6 March 2025. Never give legal advice. Always state the rule number(s).
Format your answer in clear sections:
**Answer:** [direct answer in Hinglish, 1-2 sentences]
**Key Points:**
- [bullet in Hinglish]
- [bullet in Hinglish]
**Rule Reference:** Rule [number] — [title]
**Note:** Yeh rules 6 March 2025 tak ke hain. Final decision clerk ka hoga.

{_AMENDMENT_2026}"""

_AMENDMENT_NOTE = "\n\n_(Based on rules consolidated to 6 March 2025. Verify against the current gazette for amendments after that date.)_"

_RULE_RE = re.compile(r"(?:[Rr]ules?|नियम)\s*\(?(\d+(?:-[A-Za-z]+)?(?:[A-Za-z])?)\)?")

_HINGLISH_MARKERS = re.compile(
    r"\b(kya|hai|hain|ka|ki|ke|kaise|kitna|kitni|chahiye|lagta|lagti|nahi|nahin|aur|ya|mera|meri|mujhe|karna|bata|batao|dono|sab|agar|toh|matlab|please|bhi|se|par|pe|wala|wali|liye|hota|hoti)\b",
    re.IGNORECASE
)


def _detect_language(text: str) -> str:
    if re.search(r"[ऀ-ॿ]", text):
        return "hi"
    if _HINGLISH_MARKERS.search(text):
        return "hinglish"
    return "en"


def _is_not_found(text: str) -> bool:
    cleaned = re.sub(r"[*`'\"\n\r.,!? ]", "", text).strip().upper()
    return cleaned in ("NOT_FOUND", "NOTFOUND")


def answer(question: str, chunks: List[dict]) -> dict:
    lang = _detect_language(question)
    if lang == "hi":
        system = _SYSTEM_HI
    elif lang == "hinglish":
        system = _SYSTEM_HINGLISH
    else:
        system = _SYSTEM_EN

    rule_text = "\n\n".join(
        f"Rule {c['rule']} — {c['title']}:\n{c['text']}" for c in chunks
    )
    user_msg = f"Relevant rules:\n{rule_text}\n\nQuestion: {question}"

    try:
        client = Cerebras(api_key=os.environ["CEREBRAS_API_KEY"])
        response = client.chat.completions.create(
            model=_MODEL,
            max_tokens=1024,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_msg},
            ],
        )
    except KeyError:
        return {
            "answer_text": "Error: CEREBRAS_API_KEY not set.",
            "rule_numbers": [],
            "source_excerpts": [],
            "chunks": [],
            "not_found": False,
            "language": lang,
            "error": True,
        }
    except Exception as exc:
        return {
            "answer_text": f"Error contacting Cerebras API: {exc}",
            "rule_numbers": [],
            "source_excerpts": [],
            "chunks": [],
            "not_found": False,
            "language": lang,
            "error": True,
        }

    choice = response.choices[0]
    raw = choice.message.content
    finish_reason = getattr(choice, "finish_reason", None)

    if finish_reason == "length" or raw is None:
        return {
            "answer_text": "Error: response was cut off. Try a shorter question.",
            "rule_numbers": [],
            "source_excerpts": [],
            "chunks": [],
            "not_found": False,
            "language": lang,
            "error": True,
        }

    text = raw.strip()
    not_found = _is_not_found(text)
    rule_numbers = _RULE_RE.findall(text)

    source_excerpts = [
        f"Rule {c['rule']} — {c['title']}:\n{c['text']}" for c in chunks
    ]
    chunk_objects = [
        {
            "rule": c["rule"], "title": c["title"], "text": c["text"],
            "page_start": c.get("page_start"), "page_end": c.get("page_end"),
        }
        for c in chunks
    ]

    answer_text = (
        "Not found in the rules (as consolidated to 6 March 2025)."
        if not_found
        else text + _AMENDMENT_NOTE
    )

    return {
        "answer_text": answer_text,
        "rule_numbers": rule_numbers,
        "source_excerpts": source_excerpts,
        "chunks": chunk_objects,
        "not_found": not_found,
        "language": lang,
        "error": False,
    }
