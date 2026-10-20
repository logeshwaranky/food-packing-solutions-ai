import pytest
from app.database.session import SessionLocal
from app.recommendation.engine import RecommendationEngine
from app.schemas.schemas import RecommendationRequest

def test_coffee_powder_recommendation():
    """Verify that coffee powder query selects high-barrier pouch with degassing valve."""
    db = SessionLocal()
    try:
        engine = RecommendationEngine(db)
        req = RecommendationRequest(
            query="I want to pack 250 g of coffee powder. It should retain its aroma, remain protected from moisture and oxygen, and be affordable."
        )
        res = engine.generate_recommendations(req)

        assert res.extracted_criteria.detected_food is not None
        assert "coffee" in res.extracted_criteria.detected_food.lower()
        assert res.extracted_criteria.quantity == "250 g"
        assert res.extracted_criteria.aroma_sensitivity == "High"
        assert res.extracted_criteria.oxygen_sensitivity == "High"
        assert len(res.candidates) > 0

        # Top candidate should be the foil pouch with valve or high barrier option
        top_cand = res.candidates[0]
        assert "foil" in top_cand.name.lower() or "degassing" in top_cand.name.lower() or "glass" in top_cand.name.lower()
        assert top_cand.safety_compliance_check is True
        assert top_cand.overall_suitability_score > 70.0
    finally:
        db.close()

def test_liquid_disqualification():
    """Verify that liquids cannot be packed in mesh bags or unlined paper."""
    db = SessionLocal()
    try:
        engine = RecommendationEngine(db)
        req = RecommendationRequest(
            query="I want to pack 500 ml of fresh milk in ambient storage."
        )
        res = engine.generate_recommendations(req)
        assert res.disqualified_candidates_count > 0
    finally:
        db.close()
