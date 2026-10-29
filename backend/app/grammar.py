"""
grammar.py — Context-Free Grammar validation via recursive descent parsing
====================================================================

Theory of Computation concept: CONTEXT-FREE GRAMMAR + SYNTAX VALIDATION

The language of "simple SELECT queries" is defined by this small CFG
(terminals in UPPERCASE / quotes, non-terminals in <angle brackets>):

    <query>       ::= SELECT <columns> FROM <table> <where_opt> ;

    <columns>     ::= "*"
                     | <identifier> <columns_tail>

    <columns_tail>::= "," <identifier> <columns_tail>
                     | epsilon

    <where_opt>   ::= WHERE <condition>
                     | epsilon

    <condition>   ::= <identifier> <operator> <value>

    <operator>    ::= "=" | ">" | "<" | ">=" | "<=" | "!="

    <value>       ::= NUMBER | STRING | <identifier>

    <table>       ::= <identifier>

    <identifier>  ::= IDENTIFIER   (token produced by the lexer's DFA)

This is a simple LL(1) grammar (no left recursion, each rule decidable by
looking at just one token of lookahead), so a straightforward recursive
descent parser — one Python function per non-terminal — is enough to
validate it. This is exactly how the "syntax analysis" phase of a real
compiler works, just for a much smaller language.
"""

from dataclasses import dataclass, field
from typing import List, Optional

from .lexer import Token


class ParseError(Exception):
    """Raised when the token stream does not match the grammar."""
    def __init__(self, message: str, position: Optional[int] = None):
        super().__init__(message)
        self.message = message
        self.position = position


@dataclass
class ParseResult:
    valid: bool
    errors: List[str] = field(default_factory=list)
    trace: List[str] = field(default_factory=list)  # grammar rules applied, in order


OPERATORS = {"=", ">", "<", ">=", "<=", "!="}


class Parser:
    def __init__(self, tokens: List[Token]):
        # The parser only ever looks at non-whitespace tokens.
        self.tokens = [t for t in tokens if t.type != "WHITESPACE"]
        self.pos = 0
        self.trace: List[str] = []

    # -- helpers ----------------------------------------------------------
    def _peek(self) -> Optional[Token]:
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None

    def _advance(self) -> Optional[Token]:
        tok = self._peek()
        self.pos += 1
        return tok

    def _describe(self, tok: Optional[Token]) -> str:
        return f"'{tok.value}'" if tok else "end of query"

    # -- grammar rules ------------------------------------------------------
    def parse(self) -> ParseResult:
        try:
            self.parse_query()
            return ParseResult(valid=True, errors=[], trace=self.trace)
        except ParseError as e:
            return ParseResult(valid=False, errors=[e.message], trace=self.trace)

    def parse_query(self):
        self.trace.append("<query> ::= SELECT <columns> FROM <table> <where_opt> ;")

        tok = self._peek()
        if tok is None:
            raise ParseError("Empty query. A valid query must start with SELECT.")
        if not (tok.type == "KEYWORD" and tok.value == "SELECT"):
            raise ParseError(
                f"Missing SELECT — a query must start with the SELECT keyword, "
                f"but found {self._describe(tok)} instead."
            )
        self._advance()

        self.parse_columns()

        tok = self._peek()
        if not (tok and tok.type == "KEYWORD" and tok.value == "FROM"):
            raise ParseError(
                f"Missing FROM — expected the FROM keyword after the column list, "
                f"but found {self._describe(tok)}."
            )
        self._advance()

        self.parse_table()
        self.parse_where_opt()

        tok = self._peek()
        if not (tok and tok.type == "SEMICOLON"):
            raise ParseError(
                f"Missing semicolon (;) at the end of the query "
                f"(found {self._describe(tok)} instead)."
            )
        self._advance()

        extra = self._peek()
        if extra is not None:
            raise ParseError(
                f"Unexpected token {self._describe(extra)} found after the semicolon."
            )

    def parse_columns(self):
        self.trace.append('<columns> ::= "*" | <identifier> <columns_tail>')
        tok = self._peek()
        if tok and tok.type == "STAR":
            self._advance()
            return
        self.parse_identifier(context="a column name")
        self.parse_columns_tail()

    def parse_columns_tail(self):
        tok = self._peek()
        if tok and tok.type == "COMMA":
            self.trace.append('<columns_tail> ::= "," <identifier> <columns_tail>')
            self._advance()
            self.parse_identifier(context="a column name after ','")
            self.parse_columns_tail()
        # else: epsilon production, nothing to do

    def parse_table(self):
        self.trace.append("<table> ::= <identifier>")
        tok = self._peek()
        if tok is None or tok.type != "IDENTIFIER":
            raise ParseError(
                f"Missing table name — expected an identifier after FROM, "
                f"but found {self._describe(tok)}."
            )
        self._advance()

    def parse_where_opt(self):
        tok = self._peek()
        if tok and tok.type == "KEYWORD" and tok.value == "WHERE":
            self.trace.append("<where_opt> ::= WHERE <condition>")
            self._advance()
            self.parse_condition()
        # else: epsilon — WHERE clause is optional

    def parse_condition(self):
        self.trace.append("<condition> ::= <identifier> <operator> <value>")
        self.parse_identifier(context="the left side of a WHERE condition")

        tok = self._peek()
        if tok is None or tok.type != "OPERATOR":
            raise ParseError(
                f"Invalid operator — expected one of {sorted(OPERATORS)} in the "
                f"WHERE condition, but found {self._describe(tok)}."
            )
        self._advance()

        self.parse_value()

    def parse_value(self):
        self.trace.append('<value> ::= NUMBER | STRING | <identifier>')
        tok = self._peek()
        if tok and tok.type in ("NUMBER", "STRING"):
            self._advance()
            return
        self.parse_identifier(context="the right side of a WHERE condition")

    def parse_identifier(self, context: str):
        tok = self._peek()
        if tok is None:
            raise ParseError(f"Invalid identifier — expected {context}, but the query ended.")
        if tok.type == "UNKNOWN":
            raise ParseError(
                f"Invalid identifier — the character {self._describe(tok)} is not "
                f"allowed in {context}."
            )
        if tok.type != "IDENTIFIER":
            raise ParseError(
                f"Invalid identifier — expected {context}, but found "
                f"{self._describe(tok)} ({tok.type})."
            )
        self._advance()


def validate_query(tokens: List[Token]) -> ParseResult:
    """Convenience wrapper: run the recursive-descent parser over `tokens`."""
    return Parser(tokens).parse()
