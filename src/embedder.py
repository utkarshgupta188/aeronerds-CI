import json
import os
import pickle
import re
from typing import List, Tuple

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_CACHE_FILE = "tfidf_cache.pkl"
_SUBRULE_RE = re.compile(r"(\d+)-([A-Za-z])")


def _normalize_subrules(text: str) -> str:
    """Normalize '12-A' → '12A' so TF-IDF keeps sub-rule ids as one token."""
    return _SUBRULE_RE.sub(lambda m: m.group(1) + m.group(2).lower(), text)


def embed_rules(jsonl_path: str) -> Tuple[List[dict], TfidfVectorizer]:
    """Load rules from JSONL and fit a TF-IDF vectorizer. Returns (rules, vectorizer)."""
    rules = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rules.append(json.loads(line))

    texts = [_normalize_subrules(r["title"] + " " + r["text"]) for r in rules]
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
        token_pattern=r"(?u)\b\w+\b",
    )
    vectorizer.fit(texts)
    return rules, vectorizer


_HINDI_KEYWORDS = {
    "प्लॉट": "plot",
    "सड़क": "road street",
    "जगह": "open space",
    "खाली": "open space",
    "फीस": "fees",
    "परमिशन": "permission",
    "बिल्डिंग": "building",
    "मंजिल": "floor",
    "ऊंचाई": "height",
    "पीछे": "rear",
    "आगे": "front",
    "नियम": "rule",
}

_SYNONYMS = {
    "setback": "open space",
    "gap": "open space",
    "front gap": "front open space",
    "side gap": "side open space",
    "rear gap": "rear open space",
    "floors": "floor area ratio FAR",
    "height": "height floor",
    "coverage": "ground coverage",
    "fee": "fees schedule",
    "charge": "fees",
}


def _expand_query(query: str) -> str:
    q = query.lower()
    extras = []
    for term, expansion in _SYNONYMS.items():
        if term in q:
            extras.append(expansion)
    for hindi_term, english in _HINDI_KEYWORDS.items():
        if hindi_term in query:
            extras.append(english)
    return query + " " + " ".join(extras) if extras else query


def search(query: str, rules: List[dict], vectorizer: TfidfVectorizer, top_k: int = 5) -> List[dict]:
    """Return top_k rules most similar to query, with synonym expansion."""
    expanded = _normalize_subrules(_expand_query(query))
    texts = [_normalize_subrules(r["title"] + " " + r["text"]) for r in rules]
    doc_matrix = vectorizer.transform(texts)
    query_vec = vectorizer.transform([expanded])
    scores = cosine_similarity(query_vec, doc_matrix)[0]
    top_indices = np.argsort(scores)[::-1][:top_k]
    return [rules[i] for i in top_indices]
