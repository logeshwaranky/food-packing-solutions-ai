from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import PackagingMethod, PackagingMaterial, PackagingFormat, PackagingOption, PackagingTest
from app.schemas.schemas import (
    PackagingMethodOut, PackagingMaterialOut, PackagingFormatOut, PackagingOptionOut, PackagingTestOut
)

router = APIRouter(prefix="/packaging", tags=["Packaging Library"])

@router.get("/methods", response_model=List[PackagingMethodOut])
def get_packaging_methods(
    category: Optional[str] = Query(None),
    is_process: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(PackagingMethod)
    if category:
        query = query.filter(PackagingMethod.category == category)
    if is_process is not None:
        query = query.filter(PackagingMethod.is_process_vs_material == is_process)
    return query.order_by(PackagingMethod.code).all()

@router.get("/methods/{method_id}", response_model=PackagingMethodOut)
def get_packaging_method_detail(method_id: int, db: Session = Depends(get_db)):
    method = db.query(PackagingMethod).filter(PackagingMethod.id == method_id).first()
    if not method:
        raise HTTPException(status_code=404, detail="Packaging method not found")
    return method

@router.get("/materials", response_model=List[PackagingMaterialOut])
def get_packaging_materials(
    moisture_barrier: Optional[str] = Query(None),
    oxygen_barrier: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(PackagingMaterial)
    if moisture_barrier:
        query = query.filter(PackagingMaterial.moisture_barrier == moisture_barrier)
    if oxygen_barrier:
        query = query.filter(PackagingMaterial.oxygen_barrier == oxygen_barrier)
    return query.order_by(PackagingMaterial.code).all()

@router.get("/formats", response_model=List[PackagingFormatOut])
def get_packaging_formats(db: Session = Depends(get_db)):
    return db.query(PackagingFormat).order_by(PackagingFormat.name).all()

@router.get("/options", response_model=List[PackagingOptionOut])
def get_packaging_options(
    validation_status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(PackagingOption)
    if validation_status:
        query = query.filter(PackagingOption.validation_status == validation_status)
    return query.order_by(PackagingOption.name).all()

@router.get("/options/{option_id}", response_model=PackagingOptionOut)
def get_packaging_option_detail(option_id: int, db: Session = Depends(get_db)):
    option = db.query(PackagingOption).filter(PackagingOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Packaging option not found")
    return option

@router.get("/tests", response_model=List[PackagingTestOut])
def get_packaging_tests(db: Session = Depends(get_db)):
    return db.query(PackagingTest).all()
