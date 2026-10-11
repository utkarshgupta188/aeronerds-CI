from src.answerer import _parse_json, _primary_rule, relevant_amendments

CHUNKS = [
    {"rule": "21", "title": "Fees", "text": "base fee text"},
    {"rule": "56", "title": "Open spaces", "text": "setback text"},
]


def test_primary_rule_normalises_sub_rules():
    assert _primary_rule("56(1)(a)") == "56"
    assert _primary_rule("Rule 12-A") == "12a"
    assert _primary_rule("12A") == "12a"
    assert _primary_rule("abc") == ""


def test_only_amendments_on_retrieved_rules_are_compared():
    ams = [
        {"rule_number": "21", "title": "t", "text": "x"},
        {"rule_number": "99", "title": "t", "text": "x"},
    ]
    pairs = relevant_amendments(CHUNKS, ams)
    assert len(pairs) == 1
    assert pairs[0]["base"]["text"] == "base fee text"


def test_no_amendments_means_no_pairs():
    assert relevant_amendments(CHUNKS, []) == []
    assert relevant_amendments(CHUNKS, None) == []


def test_parse_json_extracts_object_from_noisy_reply():
    assert _parse_json('sure:\n{"items": []}\nthanks') == {"items": []}
    assert _parse_json("no json here") is None
    assert _parse_json("{broken") is None
