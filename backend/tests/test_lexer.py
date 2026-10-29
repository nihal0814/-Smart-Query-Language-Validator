from app.lexer import tokenize, visible_tokens


def types(query):
    return [t.type for t in visible_tokens(tokenize(query))]


def values(query):
    return [t.value for t in visible_tokens(tokenize(query))]


def test_simple_select():
    q = "SELECT name FROM students;"
    assert types(q) == [
        "KEYWORD", "IDENTIFIER", "KEYWORD", "IDENTIFIER", "SEMICOLON",
    ]
    assert values(q) == ["SELECT", "name", "FROM", "students", ";"]


def test_multiple_columns():
    q = "SELECT name, age FROM students;"
    assert types(q) == [
        "KEYWORD", "IDENTIFIER", "COMMA", "IDENTIFIER",
        "KEYWORD", "IDENTIFIER", "SEMICOLON",
    ]


def test_where_clause_with_number():
    q = "SELECT name FROM students WHERE age > 18;"
    t = types(q)
    assert "KEYWORD" in t and "OPERATOR" in t and "NUMBER" in t
    assert t[-1] == "SEMICOLON"


def test_keyword_case_insensitive():
    q = "select name from students;"
    assert types(q)[0] == "KEYWORD"
    assert values(q)[0] == "SELECT"  # normalised to uppercase


def test_star_column():
    q = "SELECT * FROM students;"
    assert types(q) == ["KEYWORD", "STAR", "KEYWORD", "IDENTIFIER", "SEMICOLON"]


def test_string_literal():
    q = "SELECT name FROM students WHERE name = 'Amit';"
    assert "STRING" in types(q)


def test_unknown_character_is_flagged():
    q = "SELECT name FROM students@;"
    assert "UNKNOWN" in types(q)


def test_float_number():
    q = "SELECT gpa FROM students WHERE gpa > 8.5;"
    assert "NUMBER" in types(q)
    vals = values(q)
    assert "8.5" in vals
