from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import UserFeedback
from app.schemas.schemas import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/feedback", tags=["User Feedback"])

@router.post("", response_model=FeedbackOut)
def submit_feedback(request: FeedbackCreate, db: Session = Depends(get_db)):
    feedback = UserFeedback(
        recommendation_id=request.recommendation_id,
        rating=request.rating,
        comments=request.comments,
        selected_packaging_id=request.selected_packaging_id,
        user_email=request.user_email
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback
