from app.dfa import run_identifier_dfa, run_number_dfa


def test_identifier_valid():
    assert run_identifier_dfa("students").accepted is True
    assert run_identifier_dfa("_temp1").accepted is True
    assert run_identifier_dfa("a1_b2").accepted is True


def test_identifier_invalid_starts_with_digit():
    r = run_identifier_dfa("1name")
    assert r.accepted is False
    assert r.path[-1] == "qE"


def test_identifier_invalid_character():
    r = run_identifier_dfa("na-me")
    assert r.accepted is False


def test_identifier_empty():
    assert run_identifier_dfa("").accepted is False


def test_number_valid_integer():
    assert run_number_dfa("18").accepted is True


def test_number_valid_float():
    assert run_number_dfa("8.5").accepted is True


def test_number_invalid_trailing_dot():
    r = run_number_dfa("12.")
    assert r.accepted is False


def test_number_invalid_letters():
    r = run_number_dfa("12a")
    assert r.accepted is False


def test_number_invalid_leading_dot():
    r = run_number_dfa(".5")
    assert r.accepted is False
