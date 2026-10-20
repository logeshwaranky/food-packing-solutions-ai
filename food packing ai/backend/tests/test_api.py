from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["database"] == "healthy"

def test_foods_list_and_search():
    res = client.get("/api/foods?page=1&page_size=5")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert len(data["items"]) == 5

    search_res = client.get("/api/foods/search?q=rice")
    assert search_res.status_code == 200
    suggestions = search_res.json()
    assert len(suggestions) > 0

def test_packaging_methods_library():
    res = client.get("/api/packaging/methods")
    assert res.status_code == 200
    methods = res.json()
    assert len(methods) >= 16

def test_protection_guides():
    res = client.get("/api/protection-guides")
    assert res.status_code == 200
    guides = res.json()
    assert len(guides) == 9

def test_recommendation_api():
    payload = {
        "query": "I want to pack 250 g of coffee powder. It should retain its aroma, remain protected from moisture and oxygen, and be affordable."
    }
    res = client.post("/api/recommendations", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["candidates"]) > 0
    assert data["extracted_criteria"]["detected_food"] is not None
