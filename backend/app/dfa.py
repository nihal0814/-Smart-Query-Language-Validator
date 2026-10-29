"""
dfa.py — Deterministic Finite Automaton logic
====================================================================

Theory of Computation concept: FINITE AUTOMATA

An identifier and a number are each treated as a small regular language,
and each has an equivalent DFA: a 5-tuple (Q, Sigma, delta, q0, F)

    Q      = finite set of states
    Sigma  = input alphabet
    delta  = transition function  Q x Sigma -> Q
    q0     = start state
    F      = set of accepting (final) states

The functions below simulate these DFAs character by character and
return the full path of states visited, so the frontend can literally
draw the walk through the state diagram.

-------------------------------------------------------------------
DFA #1 — IDENTIFIER  ::  [A-Za-z_][A-Za-z0-9_]*
-------------------------------------------------------------------
States   : q0 (start), q1 (accepting), qE (dead / reject)
Alphabet : letters, digits, underscore, and "everything else"

    delta(q0, letter_or_underscore) = q1
    delta(q0, digit)                = qE      (can't start with a digit)
    delta(q0, other)                = qE
    delta(q1, letter_or_digit_or__)  = q1
    delta(q1, other)                = qE
    delta(qE, anything)             = qE      (dead state, no escape)

Accept if the automaton ends in q1.

-------------------------------------------------------------------
DFA #2 — NUMBER  ::  [0-9]+(\\.[0-9]+)?
-------------------------------------------------------------------
States   : q0 (start), q1 (accepting: integer part seen),
           q2 (dot seen, not yet accepting), q3 (accepting: fraction seen),
           qE (dead / reject)

    delta(q0, digit) = q1
    delta(q0, other) = qE
    delta(q1, digit) = q1
    delta(q1, '.')   = q2
    delta(q1, other) = qE
    delta(q2, digit) = q3
    delta(q2, other) = qE
    delta(q3, digit) = q3
    delta(q3, other) = qE
    delta(qE, *)     = qE

Accept if the automaton ends in q1 or q3.
"""

from dataclasses import dataclass
from typing import List


@dataclass
class DFAResult:
    input: str
    accepted: bool
    path: List[str]          # sequence of states visited, e.g. ["q0","q1","q1"]
    symbols: List[str]       # the character consumed at each step (aligned with path[1:])
    reason: str


def _char_class_identifier(ch: str) -> str:
    if ch.isalpha() or ch == "_":
        return "letter/_"
    if ch.isdigit():
        return "digit"
    return "other"


def run_identifier_dfa(s: str) -> DFAResult:
    """Simulates DFA #1 on string `s`."""
    if s == "":
        return DFAResult(s, False, ["q0"], [], "Empty string — nothing to read.")

    state = "q0"
    path = [state]
    symbols: List[str] = []

    for ch in s:
        cls = _char_class_identifier(ch)
        if state == "q0":
            state = "q1" if cls == "letter/_" else "qE"
        elif state == "q1":
            state = "q1" if cls in ("letter/_", "digit") else "qE"
        else:  # qE is a dead/trap state
            state = "qE"
        path.append(state)
        symbols.append(ch)
        if state == "qE":
            break

    accepted = state == "q1"
    if accepted:
        reason = "Ended in accepting state q1 → valid identifier."
    elif state == "qE":
        reason = "Fell into the dead state qE (e.g. started with a digit, or contains an illegal character)."
    else:
        reason = "Did not reach an accepting state."
    return DFAResult(s, accepted, path, symbols, reason)


def _char_class_number(ch: str) -> str:
    if ch.isdigit():
        return "digit"
    if ch == ".":
        return "dot"
    return "other"


def run_number_dfa(s: str) -> DFAResult:
    """Simulates DFA #2 on string `s`."""
    if s == "":
        return DFAResult(s, False, ["q0"], [], "Empty string — nothing to read.")

    state = "q0"
    path = [state]
    symbols: List[str] = []

    for ch in s:
        cls = _char_class_number(ch)
        if state == "q0":
            state = "q1" if cls == "digit" else "qE"
        elif state == "q1":
            if cls == "digit":
                state = "q1"
            elif cls == "dot":
                state = "q2"
            else:
                state = "qE"
        elif state == "q2":
            state = "q3" if cls == "digit" else "qE"
        elif state == "q3":
            state = "q3" if cls == "digit" else "qE"
        else:  # qE
            state = "qE"
        path.append(state)
        symbols.append(ch)
        if state == "qE":
            break

    accepted = state in ("q1", "q3")
    if accepted:
        reason = f"Ended in accepting state {state} → valid number."
    elif state == "q2":
        reason = "Stopped right after a decimal point with no digits after it (e.g. '12.') → not accepted."
    elif state == "qE":
        reason = "Fell into the dead state qE (illegal character for a number)."
    else:
        reason = "Did not reach an accepting state."
    return DFAResult(s, accepted, path, symbols, reason)


IDENTIFIER_STATE_DIAGRAM = {
    "states": ["q0", "q1", "qE"],
    "start": "q0",
    "accepting": ["q1"],
    "transitions": [
        {"from": "q0", "to": "q1", "on": "letter, _"},
        {"from": "q1", "to": "q1", "on": "letter, digit, _"},
        {"from": "q0", "to": "qE", "on": "digit"},
        {"from": "q0", "to": "qE", "on": "other"},
        {"from": "q1", "to": "qE", "on": "other"},
        {"from": "qE", "to": "qE", "on": "any"},
    ],
}

NUMBER_STATE_DIAGRAM = {
    "states": ["q0", "q1", "q2", "q3", "qE"],
    "start": "q0",
    "accepting": ["q1", "q3"],
    "transitions": [
        {"from": "q0", "to": "q1", "on": "digit"},
        {"from": "q1", "to": "q1", "on": "digit"},
        {"from": "q1", "to": "q2", "on": "."},
        {"from": "q2", "to": "q3", "on": "digit"},
        {"from": "q3", "to": "q3", "on": "digit"},
        {"from": "q0", "to": "qE", "on": "other"},
        {"from": "q1", "to": "qE", "on": "other"},
        {"from": "q2", "to": "qE", "on": "other"},
        {"from": "q3", "to": "qE", "on": "other"},
        {"from": "qE", "to": "qE", "on": "any"},
    ],
}
