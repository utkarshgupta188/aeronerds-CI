import os
import re
from typing import List

from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

load_dotenv()

_MODEL = "gpt-oss-120b"

_SYSTEM_EN = """You are a building-rules assistant for Bhopal Municipal Corporation clerks.
Answer questions using ONLY the rule text provided below.
If the provided rules do not contain the answer, respond with exactly the word NOT_FOUND and nothing else.
Rules are consolidated to 6 March 2025. Always include this date note in your answer.
Never give legal advice. Always state the rule number(s) you used.
Keep answers concise (under 150 words). The clerk decides; you point to the rule."""

_SYSTEM_HI = """आप भोपाल नगर पालिका निगम के क्लर्क के लिए एक भवन-नियम सहायक हैं।
नीचे दिए गए नियम पाठ का उपयोग करके ही प्रश्नों का उत्तर दें।
यदि दिए गए नियमों में उत्तर नहीं है, तो केवल NOT_FOUND लिखें।
नियम 6 मार्च 2025 तक के हैं। उत्तर में यह तारीख अवश्य बताएं।
कानूनी सलाह न दें। हमेशा नियम संख्या बताएं।
उत्तर संक्षिप्त रखें (150 शब्दों से कम)।"""

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

    if not_found:
        answer_text = "Not found in the rules (as consolidated to 6 March 2025)."
    else:
        answer_text = text + _AMENDMENT_NOTE

    return {
        "answer_text": answer_text,
        "rule_numbers": rule_numbers,
        "source_excerpts": source_excerpts,
        "not_found": not_found,
        "language": lang,
        "error": False,
    }
