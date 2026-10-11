import pytest
from src.answerer import answer

CHUNKS = [
    {
        "rule": "52",
        "title": "Fees",
        "text": "52. Fees.- The fees for permission shall be as prescribed in Schedule-I appended to these rules.",
    },
]


def test_answer_has_required_keys():
    result = answer("What is the fee for permission?", CHUNKS)
    assert "answer_text" in result
    assert "rule_numbers" in result
    assert "source_excerpts" in result
    assert "not_found" in result


def test_not_found_flag_set_for_absent_topic():
    result = answer("What is the color of the sky?", CHUNKS)
    assert result["not_found"] is True


def test_rule_number_present_when_found():
    result = answer("What is the fee for permission?", CHUNKS)
    if not result["not_found"]:
        assert len(result["rule_numbers"]) > 0
