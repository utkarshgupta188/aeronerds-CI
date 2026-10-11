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
    "This amendment is NOT in the provided rule text (which ends 6 March 2025) — "
    "state it explicitly when relevant."
)

_SYSTEM_EN = f"""You are a building-rules assistant for Bhopal Municipal Corporation clerks.
Answer questions using ONLY the rule text provided below, plus the amendment note below.
If the provided rules do not contain the answer, respond with exactly the word NOT_FOUND and nothing else.
Rules are consolidated to 6 March 2025. Always include this date note in your answer.
Never give legal advice. Always state the rule number(s) you used.
Keep answers concise (under 150 words). The clerk decides; you point to the rule.

{_AMENDMENT_2026}"""

_SYSTEM_HI = f"""आप भोपाल नगर पालिका निगम के क्लर्क के लिए एक भवन-नियम सहायक हैं।
नीचे दिए गए नियम पाठ और संशोधन नोट का उपयोग करके ही प्रश्नों का उत्तर दें।
यदि दिए गए नियमों में उत्तर नहीं है, तो केवल NOT_FOUND लिखें।
नियम 6 मार्च 2025 तक के हैं। उत्तर में यह तारीख अवश्य बताएं।
कानूनी सलाह न दें। हमेशा नियम संख्या बताएं।
उत्तर संक्षिप्त रखें (150 शब्दों से कम)।

महत्वपूर्ण — 28 अगस्त 2026 का संशोधन, नियम 2(5)(ग): 500 वर्ग मीटर तक के भूखंड जो विकास योजना के अनुरूप हैं, उन्हें भवन स्वीकृति से पहले अलग T&CP विकास अनुमति लेने से छूट मिली है।"""

_AMENDMENT_NOTE = "\n\n_(Based on rules consolidated to 6 March 2025. Amendments after that date are not included — verify against the current gazette.)_"

_RULE_RE = re.compile(r"(?:[Rr]ules?|नियम)\s*\(?(\d+(?:-[A-Za-z]+)?(?:[A-Za-z])?)\)?")


def _detect_language(text: str) -> str:
    if re.search(r"[ऀ-ॿ]", text):
        return "hi"
    return "en"


def _is_not_found(text: str) -> bool:
    cleaned = re.sub(r"[*`'\"\n\r.,!? ]", "", text).strip().upper()
    return cleaned in ("NOT_FOUND", "NOTFOUND")


def answer(question: str, chunks: List[dict]) -> dict:
    lang = _detect_language(question)
    system = _SYSTEM_HI if lang == "hi" else _SYSTEM_EN

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
            "not_found": False,
            "language": lang,
            "error": True,
        }
    except Exception as exc:
        return {
            "answer_text": f"Error contacting Cerebras API: {exc}",
            "rule_numbers": [],
            "source_excerpts": [],
            "not_found": False,
            "language": lang,
            "error": True,
        }

    choice = response.choices[0]
    raw = choice.message.content
    finish_reason = getattr(choice, "finish_reason", None)

    if finish_reason == "length" or raw is None:
        return {
            "answer_text": "Error: response was cut off. Try a shorter question or fewer rules.",
            "rule_numbers": [],
            "source_excerpts": [],
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
        {"rule": c["rule"], "title": c["title"], "text": c["text"]}
        for c in chunks
    ]

    if not_found:
        answer_text = "Not found in the rules (as consolidated to 6 March 2025)."
    else:
        answer_text = text + _AMENDMENT_NOTE

    return {
        "answer_text": answer_text,
        "rule_numbers": rule_numbers,
        "source_excerpts": source_excerpts,
        "chunks": chunk_objects,
        "not_found": not_found,
        "language": lang,
        "error": False,
    }
