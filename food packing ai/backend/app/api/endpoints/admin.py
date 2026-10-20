from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import (
    FoodType, FoodCategory, PackagingMethod, PackagingMaterial, PackagingOption,
    PackagingTest, UserFeedback, FoodProperty, PackagingRequirement, FoodPackagingCompatibility, User
)
from app.schemas.schemas import AdminStatsOut, FoodTypeCreate, FoodTypeDetail
from app.api.endpoints.auth import get_current_admin
from app.database.import_dataset import populate_database
import shutil
import tempfile
import os

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    total_foods = db.query(FoodType).count()
    total_cats = db.query(FoodCategory).count()
    total_methods = db.query(PackagingMethod).count()
    total_materials = db.query(PackagingMaterial).count()
    total_options = db.query(PackagingOption).count()
    total_tests = db.query(PackagingTest).count()
    total_feedbacks = db.query(UserFeedback).count()

    approved_count = db.query(PackagingOption).filter(PackagingOption.validation_status == "approved").count()
    tested_count = db.query(PackagingOption).filter(PackagingOption.validation_status == "tested").count()
    candidate_count = db.query(PackagingOption).filter(PackagingOption.validation_status == "candidate").count()
    rejected_count = db.query(PackagingOption).filter(PackagingOption.validation_status == "rejected").count()

    return AdminStatsOut(
        total_foods=total_foods,
        total_categories=total_cats,
        total_packaging_methods=total_methods,
        total_materials=total_materials,
        total_options=total_options,
        total_tests=total_tests,
        total_feedbacks=total_feedbacks,
        validation_status_breakdown={
            "Approved": approved_count,
            "Tested": tested_count,
            "Candidate": candidate_count,
            "Rejected": rejected_count
        }
    )

@router.post("/foods", response_model=FoodTypeDetail)
def create_food(food_in: FoodTypeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    existing = db.query(FoodType).filter(FoodType.code == food_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Food with code {food_in.code} already exists.")

    cat = db.query(FoodCategory).filter(FoodCategory.id == food_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid category ID.")

    food = FoodType(
        code=food_in.code,
        name=food_in.name,
        category_id=food_in.category_id,
        physical_state=food_in.physical_state,
        description=food_in.description,
        validation_priority=food_in.validation_priority
    )
    db.add(food)
    db.flush()

    fprop = FoodProperty(
        food_id=food.id,
        moisture_level=food_in.moisture_level,
        oxygen_sensitivity=food_in.oxygen_sensitivity,
        spoilage_risk=food_in.spoilage_risk,
        storage_temperature=food_in.storage_temperature,
        storage_handling_note=food_in.storage_handling_note
    )
    db.add(fprop)

    freq = PackagingRequirement(
        food_id=food.id,
        requirements_text=food_in.packaging_requirements or "Food contact safe packaging"
    )
    db.add(freq)

    if food_in.packaging_option_id:
        fcomp = FoodPackagingCompatibility(
            food_id=food.id,
            packaging_option_id=food_in.packaging_option_id,
            compatibility_level="Highly Recommended",
            suitability_score=90.0,
            reasons="Manually configured by packaging specialist in Admin console",
            validation_status="approved"
        )
        db.add(fcomp)

    db.commit()
    db.refresh(food)
    return food

@router.delete("/foods/{food_id}")
def delete_food(food_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    food = db.query(FoodType).filter(FoodType.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    db.delete(food)
    db.commit()
    return {"message": f"Food {food.name} successfully deleted."}

@router.post("/import")
async def import_dataset_file(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are currently supported.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        populate_database(excel_path=tmp_path)
        return {"message": "Dataset successfully imported and validated!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
