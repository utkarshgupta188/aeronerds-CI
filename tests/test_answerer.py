import pytest
from src.answerer import answer, _is_not_found

CHUNKS = [
    {
        "rule": "52",
        "title": "Distance from electric lines",
        "text": "52. Distance from electric lines.- (1) No building, balcony or other structure shall be erected or re-erected within the following distances of any overhead electric supply line: (a) Low and medium voltage lines and service lines: Vertically 2.5 m, Horizontally 1.2 m.",
    },
]


def test_is_not_found_exact():
    assert _is_not_found("NOT_FOUND") is True
    assert _is_not_found("**NOT_FOUND**") is True
    assert _is_not_found("The answer is NOT_FOUND here") is False


def test_answer_has_required_keys():
    result = answer("How far must my balcony stay from a low-voltage electric line?", CHUNKS)
    assert "answer_text" in result
    assert "rule_numbers" in result
    assert "source_excerpts" in result
    assert "not_found" in result


def test_not_found_flag_set_for_absent_topic():
    result = answer("What is the color of the sky?", CHUNKS)
    assert result["not_found"] is True


def test_rule_number_present_when_answered():
    result = answer("How far must my balcony stay from a low-voltage electric line?", CHUNKS)
    assert result["not_found"] is False
    assert len(result["rule_numbers"]) > 0
