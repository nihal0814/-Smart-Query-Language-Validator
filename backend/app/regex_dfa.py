"""Parse the small regular-expression language and construct a DFA.

Supported operators are union (``|``), implicit concatenation, grouping and
Kleene star (``*``).  Every other character is a literal; a backslash quotes
the following character.
"""

from dataclasses import dataclass
from typing import Dict, FrozenSet, List, Set, Tuple


class RegexSyntaxError(ValueError):
    """Raised when a regular expression is not in the supported syntax."""


@dataclass(frozen=True)
class _Node:
    kind: str
    value: str = ""
    left: "_Node | None" = None
    right: "_Node | None" = None


class _Parser:
    def __init__(self, expression: str):
        self.expression = expression
        self.pos = 0

    def parse(self) -> _Node:
        if not self.expression:
            raise RegexSyntaxError("Regular expression cannot be empty.")
        node = self._union()
        if self.pos != len(self.expression):
            raise RegexSyntaxError(
                f"Unexpected '{self.expression[self.pos]}' at position {self.pos}."
            )
        return node

    def _union(self) -> _Node:
        node = self._concat()
        while self._take("|"):
            if self._at_end() or self._peek() in "|)":
                raise RegexSyntaxError("Union '|' must have an expression on both sides.")
            node = _Node("union", left=node, right=self._concat())
        return node

    def _concat(self) -> _Node:
        if self._at_end() or self._peek() in "|)":
            raise RegexSyntaxError("Expected a literal or '(' in the expression.")
        node = self._repeat()
        while not self._at_end() and self._peek() not in "|)":
            node = _Node("concat", left=node, right=self._repeat())
        return node

    def _repeat(self) -> _Node:
        node = self._atom()
        if self._take("*"):
            node = _Node("star", left=node)
            if not self._at_end() and self._peek() == "*":
                raise RegexSyntaxError("Repeated '*' operators are not supported.")
        return node

    def _atom(self) -> _Node:
        if self._at_end():
            raise RegexSyntaxError("Expected a literal or '(' in the expression.")
        char = self._peek()
        if char == "\\":
            self.pos += 1
            if self._at_end():
                raise RegexSyntaxError("A trailing backslash must escape a character.")
            char = self.expression[self.pos]
            self.pos += 1
            return _Node("literal", value=char)
        if char == "(":
            self.pos += 1
            if not self._at_end() and self._peek() == ")":
                raise RegexSyntaxError("Empty groups are not supported.")
            node = self._union()
            if not self._take(")"):
                raise RegexSyntaxError("Unclosed grouping parenthesis.")
            return node
        if char in "|)*":
            raise RegexSyntaxError(f"Unexpected '{char}' at position {self.pos}.")
        self.pos += 1
        return _Node("literal", value=char)

    def _peek(self) -> str:
        return self.expression[self.pos]

    def _take(self, value: str) -> bool:
        if not self._at_end() and self._peek() == value:
            self.pos += 1
            return True
        return False

    def _at_end(self) -> bool:
        return self.pos >= len(self.expression)


@dataclass
class _Fragment:
    start: int
    end: int


def _thompson(node: _Node, transitions: Dict[int, List[Tuple[str | None, int]]],
              next_state: List[int]) -> _Fragment:
    def new_state() -> int:
        state = next_state[0]
        next_state[0] += 1
        transitions[state] = []
        return state

    if node.kind == "literal":
        start, end = new_state(), new_state()
        transitions[start].append((node.value, end))
        return _Fragment(start, end)
    if node.kind == "concat":
        left = _thompson(node.left, transitions, next_state)
        right = _thompson(node.right, transitions, next_state)
        transitions[left.end].append((None, right.start))
        return _Fragment(left.start, right.end)
    if node.kind == "union":
        start, end = new_state(), new_state()
        left = _thompson(node.left, transitions, next_state)
        right = _thompson(node.right, transitions, next_state)
        transitions[start].extend([(None, left.start), (None, right.start)])
        transitions[left.end].append((None, end))
        transitions[right.end].append((None, end))
        return _Fragment(start, end)
    inner = _thompson(node.left, transitions, next_state)
    start, end = new_state(), new_state()
    transitions[start].extend([(None, inner.start), (None, end)])
    transitions[inner.end].extend([(None, inner.start), (None, end)])
    return _Fragment(start, end)


def _closure(states: Set[int], nfa: Dict[int, List[Tuple[str | None, int]]]) -> FrozenSet[int]:
    result = set(states)
    stack = list(states)
    while stack:
        state = stack.pop()
        for symbol, target in nfa[state]:
            if symbol is None and target not in result:
                result.add(target)
                stack.append(target)
    return frozenset(result)


def build_regex_dfa(regex: str, test_string: str) -> dict:
    """Return the serializable DFA and the simulation result for ``test_string``."""
    root = _Parser(regex).parse()
    nfa: Dict[int, List[Tuple[str | None, int]]] = {}
    fragment = _thompson(root, nfa, [0])
    alphabet = sorted({
        symbol for edges in nfa.values() for symbol, _ in edges if symbol is not None
    })

    start_set = _closure({fragment.start}, nfa)
    subsets: List[FrozenSet[int]] = [start_set]
    subset_ids = {start_set: "q0"}
    dfa_transitions: Dict[Tuple[str, str], str] = {}
    index = 0
    while index < len(subsets):
        current = subsets[index]
        current_id = subset_ids[current]
        for symbol in alphabet:
            targets = {
                target for state in current for edge_symbol, target in nfa[state]
                if edge_symbol == symbol
            }
            target_set = _closure(targets, nfa)
            if target_set not in subset_ids:
                subset_ids[target_set] = f"q{len(subsets)}"
                subsets.append(target_set)
            dfa_transitions[(current_id, symbol)] = subset_ids[target_set]
        index += 1

    dead_id = f"q{len(subsets)}"
    states = [f"q{i}" for i in range(len(subsets))]
    transitions = [
        {"from": state, "to": dfa_transitions[(state, symbol)], "on": symbol}
        for state in states for symbol in alphabet
    ]
    accepting = [
        subset_ids[subset] for subset in subsets if fragment.end in subset
    ]

    path = ["q0"]
    symbols: List[str] = []
    current = "q0"
    for char in test_string:
        symbols.append(char)
        target = dfa_transitions.get((current, char))
        if target is None:
            current = dead_id
        else:
            current = target
        path.append(current)
    accepted = current in accepting and len(symbols) == len(test_string)
    if accepted:
        reason = "The test string ends in an accepting DFA state."
    elif any(char not in alphabet for char in test_string):
        reason = "The test string contains a symbol outside the regex alphabet."
    else:
        reason = "The test string ends in a non-accepting DFA state."

    if any(char not in alphabet for char in test_string):
        states.append(dead_id)
        transitions.extend(
            {"from": dead_id, "to": dead_id, "on": symbol} for symbol in alphabet
        )
    return {
        "regex": regex,
        "alphabet": alphabet,
        "states": states,
        "start": "q0",
        "accepting": accepting,
        "transitions": transitions,
        "path": path,
        "symbols": symbols,
        "accepted": accepted,
        "reason": reason,
    }
