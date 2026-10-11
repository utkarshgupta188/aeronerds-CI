import json
import os
import pickle
from typing import List, Tuple

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_CACHE_FILE = "tfidf_cache.pkl"


def embed_rules(jsonl_path: str) -> Tuple[List[dict], TfidfVectorizer]:
    """Load rules from JSONL and fit a TF-IDF vectorizer. Returns (rules, vectorizer)."""
    rules = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rules.append(json.loads(line))

    texts = [r["title"] + " " + r["text"] for r in rules]
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
    )
    vectorizer.fit(texts)
    return rules, vectorizer


def search(query: str, rules: List[dict], vectorizer: TfidfVectorizer, top_k: int = 5) -> List[dict]:
    """Return top_k rules most similar to query."""
    texts = [r["title"] + " " + r["text"] for r in rules]
    doc_matrix = vectorizer.transform(texts)
    query_vec = vectorizer.transform([query])
    scores = cosine_similarity(query_vec, doc_matrix)[0]
    top_indices = np.argsort(scores)[::-1][:top_k]
    return [rules[i] for i in top_indices]
