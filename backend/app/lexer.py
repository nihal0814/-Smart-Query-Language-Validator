"""
lexer.py — Lexical Analyzer for the Smart Query Language Validator
====================================================================

Theory of Computation concept: LEXICAL ANALYSIS + REGULAR EXPRESSIONS

A lexer (a.k.a. "tokenizer" or "scanner") is, in TOC terms, the practical
implementation of a set of regular languages. Every token type below
(KEYWORD, IDENTIFIER, NUMBER, ...) is defined by a regular expression,
and a regular expression is exactly equivalent to a Deterministic Finite
Automaton (DFA) that accepts the same language (Kleene's theorem).

So this file answers: "Given the input string, what is the sequence of
tokens (the words of the language) that make it up?"
"""

import re
from dataclasses import dataclass, asdict
from typing import List

# ---------------------------------------------------------------------------
# 1. Vocabulary of the language, defined purely with regular expressions.
#    The ORDER matters: the master pattern tries alternatives left to right,
#    so more specific patterns (KEYWORD) must be listed before the more
#    general ones they could be confused with (IDENTIFIER).
# ---------------------------------------------------------------------------

KEYWORDS = {"SELECT", "FROM", "WHERE", "AND", "OR", "NOT"}

TOKEN_SPECIFICATION = [
    ("KEYWORD",    r"\b(?:SELECT|FROM|WHERE|AND|OR|NOT)\b"),
    ("OPERATOR",   r">=|<=|!=|=|>|<"),
    ("NUMBER",     r"\d+(?:\.\d+)?"),
    ("STRING",     r"'[^']*'|\"[^\"]*\""),
    ("COMMA",      r","),
    ("SEMICOLON",  r";"),
    ("STAR",       r"\*"),
    ("IDENTIFIER", r"[A-Za-z_][A-Za-z0-9_]*"),
    ("WHITESPACE", r"[ \t\r\n]+"),
    ("UNKNOWN",    r"."),  # catch-all: anything else is an invalid character
]

MASTER_PATTERN = re.compile(
    "|".join(f"(?P<{name}>{pattern})" for name, pattern in TOKEN_SPECIFICATION),
    re.IGNORECASE,
)


@dataclass
class Token:
    type: str
    value: str
    position: int  # 0-indexed character offset in the source query

    def to_dict(self):
        return asdict(self)


def tokenize(query: str) -> List[Token]:
    """
    Scans `query` left to right using the master regular expression and
    returns the list of tokens found, INCLUDING whitespace tokens.
    (The parser/validator filters whitespace out later — keeping it here
    means the lexer output is a faithful, lossless record of the scan.)

    This loop is exactly what a DFA-based scanner does under the hood:
    at every position, try to match the longest/earliest valid pattern,
    move the read head forward, and repeat until end of input.
    """
    tokens: List[Token] = []
    for match in MASTER_PATTERN.finditer(query):
        kind = match.lastgroup
        value = match.group()
        start = match.start()

        # Keywords are matched case-insensitively but normalised to upper
        # case for clarity, and identifiers that happen to equal a keyword
        # (shouldn't happen due to ordering, kept as a safety net) too.
        if kind == "KEYWORD":
            value_out = value.upper()
        else:
            value_out = value

        tokens.append(Token(type=kind, value=value_out, position=start))
    return tokens


def visible_tokens(tokens: List[Token]) -> List[Token]:
    """Tokens with whitespace stripped out — what the parser consumes."""
    return [t for t in tokens if t.type != "WHITESPACE"]
