"""
main.py — FastAPI application for the Smart Query Language Validator

Endpoints:
    GET  /health              -> simple liveness check
    POST /api/tokenize        -> run the lexer only, return the token list
    POST /api/validate        -> run lexer + CFG parser, return full report
    POST /api/dfa-check       -> run a single string through the identifier
                                  or number DFA (powers the DFA Visualizer page)

No external SQL parser is used and no query is ever executed — every
token, state transition and grammar rule is produced by the hand-written
lexer.py / dfa.py / grammar.py modules in this project.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal

from .lexer import tokenize, visible_tokens
from .grammar import validate_query
from .dfa import (
    run_identifier_dfa,
    run_number_dfa,
    IDENTIFIER_STATE_DIAGRAM,
    NUMBER_STATE_DIAGRAM,
)

app = FastAPI(
    title="Smart Query Language Validator API",
    description="Lexical analysis, DFA simulation and CFG-based syntax validation for a small SQL-like query language.",
    version="1.0.0",
)

# Allow the Vite dev server (and any origin, for simplicity in this student project)
# to call the API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------

class QueryIn(BaseModel):
    query: str = Field(..., description="The SQL-like query to analyse")


class DFACheckIn(BaseModel):
    value: str = Field(..., description="The raw string to test")
    kind: Literal["identifier", "number"] = Field(..., description="Which DFA to run")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "service": "smart-query-language-validator"}


@app.post("/api/tokenize")
def api_tokenize(payload: QueryIn):
    all_tokens = tokenize(payload.query)
    shown = visible_tokens(all_tokens)

    unknown = [t for t in shown if t.type == "UNKNOWN"]
    errors = [
        f"Invalid character '{t.value}' at position {t.position}." for t in unknown
    ]

    return {
        "query": payload.query,
        "tokens": [t.to_dict() for t in shown],
        "token_count": len(shown),
        "errors": errors,
    }


@app.post("/api/validate")
def api_validate(payload: QueryIn):
    query = payload.query

    if query.strip() == "":
        return {
            "query": query,
            "valid": False,
            "tokens": [],
            "errors": ["Empty query. Please enter a query, e.g. SELECT name FROM students;"],
            "grammar_trace": [],
        }

    all_tokens = tokenize(query)
    shown = visible_tokens(all_tokens)

    # 1. Lexical errors (illegal characters) — reported even if we also try to parse.
    lexical_errors = [
        f"Invalid character '{t.value}' at position {t.position}."
        for t in shown
        if t.type == "UNKNOWN"
    ]

    # 2. Syntax / grammar validation (CFG, recursive-descent parser).
    result = validate_query(shown)

    errors = lexical_errors + result.errors
    valid = result.valid and not lexical_errors

    return {
        "query": query,
        "valid": valid,
        "tokens": [t.to_dict() for t in shown],
        "errors": errors,
        "grammar_trace": result.trace,
    }


@app.post("/api/dfa-check")
def api_dfa_check(payload: DFACheckIn):
    if payload.kind == "identifier":
        result = run_identifier_dfa(payload.value)
        diagram = IDENTIFIER_STATE_DIAGRAM
    else:
        result = run_number_dfa(payload.value)
        diagram = NUMBER_STATE_DIAGRAM

    return {
        "input": result.input,
        "accepted": result.accepted,
        "path": result.path,
        "symbols": result.symbols,
        "reason": result.reason,
        "diagram": diagram,
    }
