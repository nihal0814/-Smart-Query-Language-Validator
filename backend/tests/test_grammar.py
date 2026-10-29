from app.lexer import tokenize, visible_tokens
from app.grammar import validate_query


def check(query):
    tokens = visible_tokens(tokenize(query))
    return validate_query(tokens)


def test_valid_simple_query():
    r = check("SELECT name FROM students;")
    assert r.valid is True
    assert r.errors == []


def test_valid_multiple_columns():
    r = check("SELECT name, age FROM students;")
    assert r.valid is True


def test_valid_where_clause():
    r = check("SELECT name FROM students WHERE age > 18;")
    assert r.valid is True


def test_valid_star():
    r = check("SELECT * FROM students;")
    assert r.valid is True


def test_missing_select():
    r = check("name FROM students;")
    assert r.valid is False
    assert any("SELECT" in e for e in r.errors)


def test_missing_from():
    r = check("SELECT name students;")
    assert r.valid is False
    assert any("FROM" in e for e in r.errors)


def test_missing_table_name():
    r = check("SELECT name FROM;")
    assert r.valid is False
    assert any("table name" in e for e in r.errors)


def test_missing_semicolon():
    r = check("SELECT name FROM students")
    assert r.valid is False
    assert any("semicolon" in e.lower() for e in r.errors)


def test_invalid_operator():
    r = check("SELECT name FROM students WHERE age ?? 18;")
    assert r.valid is False


def test_trailing_comma_in_columns():
    r = check("SELECT name, FROM students;")
    assert r.valid is False
