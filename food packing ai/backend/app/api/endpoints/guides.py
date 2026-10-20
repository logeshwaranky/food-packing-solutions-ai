from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from app.services.guide_service import get_all_protection_guides, get_protection_guide_by_id

router = APIRouter(prefix="/protection-guides", tags=["Food Protection Guide"])

@router.get("", response_model=List[Dict[str, Any]])
def list_protection_guides():
    return get_all_protection_guides()

@router.get("/{guide_id}", response_model=Dict[str, Any])
def get_protection_guide(guide_id: str):
    guide = get_protection_guide_by_id(guide_id)
    if not guide:
        raise HTTPException(status_code=404, detail="Protection guide vector not found")
    return guide
