from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_tokenize_endpoint():
    resp = client.post("/api/tokenize", json={"query": "SELECT name FROM students;"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["token_count"] == 5
    assert data["tokens"][0]["type"] == "KEYWORD"
    assert data["tokens"][0]["value"] == "SELECT"


def test_validate_endpoint_valid_query():
    resp = client.post(
        "/api/validate",
        json={"query": "SELECT name FROM students WHERE age > 18;"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is True
    assert data["errors"] == []
    assert len(data["tokens"]) > 0
    assert len(data["grammar_trace"]) > 0


def test_validate_endpoint_invalid_query():
    resp = client.post("/api/validate", json={"query": "SELECT FROM students;"})
    data = resp.json()
    assert data["valid"] is False
    assert len(data["errors"]) > 0


def test_validate_endpoint_empty_query():
    resp = client.post("/api/validate", json={"query": ""})
    data = resp.json()
    assert data["valid"] is False
    assert "Empty query" in data["errors"][0]


def test_dfa_check_identifier():
    resp = client.post("/api/dfa-check", json={"value": "student1", "kind": "identifier"})
    data = resp.json()
    assert data["accepted"] is True
    assert data["path"][0] == "q0"


def test_dfa_check_number_invalid():
    resp = client.post("/api/dfa-check", json={"value": "12.", "kind": "number"})
    data = resp.json()
    assert data["accepted"] is False
