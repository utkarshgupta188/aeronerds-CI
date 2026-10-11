import pytest
from src.embedder import embed_rules, search

SAMPLE = "data/bhumi_vikas_rules_sample.jsonl"


def test_embed_rules_returns_correct_count():
    rules, vectorizer = embed_rules(SAMPLE)
    assert len(rules) == 5


def test_search_returns_top_k():
    rules, vectorizer = embed_rules(SAMPLE)
    results = search("building permission fee", rules, vectorizer, top_k=3)
    assert len(results) == 3
    assert "rule" in results[0]
    assert "text" in results[0]


def test_search_not_found_returns_results_anyway():
    rules, vectorizer = embed_rules(SAMPLE)
    results = search("xyz nonsense query", rules, vectorizer, top_k=2)
    assert len(results) == 2
