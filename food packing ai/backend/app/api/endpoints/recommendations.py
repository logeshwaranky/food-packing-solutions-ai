from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import RecommendationRequest, RecommendationResponse
from app.recommendation.engine import RecommendationEngine

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])

@router.post("", response_model=RecommendationResponse)
def get_recommendations(request: RecommendationRequest, db: Session = Depends(get_db)):
    engine = RecommendationEngine(db)
    return engine.generate_recommendations(request)
