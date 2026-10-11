import json
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


_PRIMARY_RE = re.compile(r"\d+(?:-?[A-Za-z])?")


def _primary_rule(value) -> str:
    m = _PRIMARY_RE.search(str(value))
    return m.group(0).replace("-", "").lower() if m else ""


def _format_amendment(a: dict) -> str:
    return (
        f"[AMENDMENT — Rule {a.get('rule_number')}, effective {a.get('effective_date') or 'unknown'}] "
        f"{a.get('title', '')}: {a.get('text', '')}"
    )


def relevant_amendments(chunks: List[dict], amendments: List[dict], limit: int = 3) -> List[dict]:
    """Amendments whose rule is among the retrieved rules, paired with that rule's base text."""
    by_rule = {_primary_rule(c["rule"]): c for c in chunks}
    out = []
    for a in amendments or []:
        base = by_rule.get(_primary_rule(a.get("rule_number")))
        if base is not None:
            out.append({"amendment": a, "base": base})
    return out[:limit]


def _parse_json(text: str):
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


def _tri(v):
    return v if isinstance(v, bool) else None


def compare_amendments(question: str, pairs: List[dict], lang: str) -> List[dict]:
    if not pairs:
        return []
    blocks = []
    for i, p in enumerate(pairs):
        a, b = p["amendment"], p["base"]
        blocks.append(
            f"#{i}\nBASE RULE {b['rule']} — {b['title']}:\n{b['text']}\n"
            f"AMENDMENT to Rule {a.get('rule_number')} (effective {a.get('effective_date') or 'unknown'}) "
            f"— {a.get('title', '')}:\n{a.get('text', '')}"
        )
    reply_lang = {"hi": "Hindi", "hinglish": "Hinglish (Hindi-English mix)"}.get(lang, "English")
    system = (
        "You compare a base building rule with a later amendment for one citizen's question. "
        "Use ONLY the texts given. For each numbered item decide whether the situation described in the "
        "question qualifies under the OLD (base) rule and under the NEW (amended) rule. "
        "Use true or false when the question gives enough facts; use null when it does not. "
        f"Write old, new and reason in {reply_lang}, one short sentence each. "
        'Reply with JSON only: {"items":[{"index":0,"old":"...","new":"...",'
        '"qualifies_old":true,"qualifies_new":false,"reason":"..."}]}'
    )
    try:
        client = Cerebras(api_key=os.environ["CEREBRAS_API_KEY"])
        resp = client.chat.completions.create(
            model=_MODEL,
            max_tokens=2500,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": "\n\n".join(blocks) + f"\n\nQuestion: {question}"},
            ],
        )
        data = _parse_json(resp.choices[0].message.content or "")
    except Exception:
        return []
    if not data:
        return []
    checks = []
    for item in data.get("items", []):
        idx = item.get("index")
        if not isinstance(idx, int) or not 0 <= idx < len(pairs):
            continue
        a, b = pairs[idx]["amendment"], pairs[idx]["base"]
        checks.append({
            "rule": b["rule"],
            "title": a.get("title", ""),
            "effective_date": a.get("effective_date"),
            "old": str(item.get("old", "")),
            "new": str(item.get("new", "")),
            "qualifies_old": _tri(item.get("qualifies_old")),
            "qualifies_new": _tri(item.get("qualifies_new")),
            "reason": str(item.get("reason", "")),
        })
    return checks


def answer(question: str, chunks: List[dict], amendments: List[dict] = None, doc_chunks: List[dict] = None) -> dict:
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
    doc_text = ""
    if doc_chunks:
        doc_sections = "\n\n".join(
            f"[Uploaded document — {c.get('title', 'Document')}]:\n{c['text']}"
            for c in doc_chunks
        )
        doc_text = (
            "\n\nUPLOADED REFERENCE DOCUMENTS (use these alongside the rules above; "
            "attribute answers from uploaded docs separately from base rules):\n"
            + doc_sections
        )
    amend_text = ""
    if amendments:
        amend_text = "\n\nLATEST AMENDMENTS (take precedence over base rules):\n" + "\n".join(
            _format_amendment(a) for a in amendments
        )
    user_msg = f"Relevant rules:\n{rule_text}{doc_text}{amend_text}\n\nQuestion: {question}"

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
            "source_type": c.get("source_type", "base_rules"),
        }
        for c in chunks
    ]
    if doc_chunks:
        for dc in doc_chunks:
            chunk_objects.append({
                "rule": dc.get("rule", "—"), "title": dc.get("title", "Uploaded document"),
                "text": dc["text"], "page_start": None, "page_end": None,
                "source_type": "uploaded_doc",
            })

    answer_text = (
        "Not found in the rules (as consolidated to 6 March 2025)."
        if not_found
        else text + _AMENDMENT_NOTE
    )

    amendment_checks = []
    if amendments and not not_found:
        amendment_checks = compare_amendments(question, relevant_amendments(chunks, amendments), lang)

    return {
        "answer_text": answer_text,
        "rule_numbers": rule_numbers,
        "source_excerpts": source_excerpts,
        "chunks": chunk_objects,
        "amendment_checks": amendment_checks,
        "not_found": not_found,
        "language": lang,
        "error": False,
    }
