import os
import re
from typing import List

from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

load_dotenv()

_MODEL = "qwen-3.8-27b"

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


def _detect_language(text: str) -> str:
    if re.search(r"[ऀ-ॿ]", text):
        return "hi"
    return "en"


def answer(question: str, chunks: List[dict]) -> dict:
    lang = _detect_language(question)
    system = _SYSTEM_HI if lang == "hi" else _SYSTEM_EN

    rule_text = "\n\n".join(
        f"Rule {c['rule']} — {c['title']}:\n{c['text']}" for c in chunks
    )
    user_msg = f"Relevant rules:\n{rule_text}\n\nQuestion: {question}"

    client = Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY"))
    response = client.chat.completions.create(
        model=_MODEL,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_msg},
        ],
    )
    text = response.choices[0].message.content.strip()

    not_found = "NOT_FOUND" in text

    rule_numbers = re.findall(r"[Rr]ule\s+(\d+[\w\-]*)", text)
    if not rule_numbers and not not_found:
        rule_numbers = [c["rule"] for c in chunks[:1]]

    source_excerpts = [
        f"Rule {c['rule']} — {c['title']}: {c['text'][:300]}..." for c in chunks
    ]

    return {
        "answer_text": text if not not_found else "Not found in the rules (as consolidated to 6 March 2025).",
        "rule_numbers": rule_numbers,
        "source_excerpts": source_excerpts,
        "not_found": not_found,
        "language": lang,
    }
