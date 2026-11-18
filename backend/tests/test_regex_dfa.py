import pytest

from app.regex_dfa import RegexSyntaxError, build_regex_dfa


def test_union_concatenation_and_star():
    result = build_regex_dfa("(a|b)*abb", "aabb")
    assert result["accepted"] is True
    assert result["path"][0] == "q0"
    assert all(isinstance(state, str) for state in result["states"])
    assert result["symbols"] == list("aabb")


def test_rejects_nonmatching_string():
    result = build_regex_dfa("a(b|c)*", "ad")
    assert result["accepted"] is False
    assert result["reason"].startswith("The test string contains")


def test_nullable_regex():
    result = build_regex_dfa("a*", "")
    assert result["accepted"] is True


def test_invalid_regex():
    with pytest.raises(RegexSyntaxError):
        build_regex_dfa("a|", "")
