from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.models import FoodType, FoodCategory, FoodProperty, PackagingRequirement, FoodPackagingCompatibility
from app.schemas.schemas import FoodTypeSummary, FoodTypeDetail, FoodCategoryOut

router = APIRouter(prefix="/foods", tags=["Foods"])

@router.get("/categories", response_model=List[FoodCategoryOut])
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(FoodCategory).order_by(FoodCategory.display_order, FoodCategory.name).all()
    results = []
    for c in cats:
        count = db.query(FoodType).filter(FoodType.category_id == c.id).count()
        results.append(FoodCategoryOut(
            id=c.id,
            name=c.name,
            slug=c.slug,
            description=c.description,
            icon=c.icon,
            typical_spoilage_risks=c.typical_spoilage_risks,
            display_order=c.display_order,
            food_count=count
        ))
    return results

@router.get("/search")
def search_suggestions(q: str = Query(..., min_length=1), limit: int = 10, db: Session = Depends(get_db)):
    """Fast autocomplete endpoint for search suggestions."""
    foods = db.query(FoodType).filter(
        or_(
            FoodType.name.ilike(f"%{q}%"),
            FoodType.code.ilike(f"%{q}%")
        )
    ).limit(limit).all()
    return [{"id": f.id, "code": f.code, "name": f.name, "category": f.category.name if f.category else None} for f in foods]

@router.get("", response_model=dict)
def get_foods(
    q: Optional[str] = Query(None, description="Search term for food name or code"),
    category_id: Optional[int] = Query(None),
    physical_state: Optional[str] = Query(None),
    moisture_level: Optional[str] = Query(None),
    oxygen_sensitivity: Optional[str] = Query(None),
    spoilage_risk: Optional[str] = Query(None),
    storage_temp: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    sort_by: str = Query("name", description="name, code, or category"),
    sort_order: str = Query("asc", description="asc or desc"),
    db: Session = Depends(get_db)
):
    query = db.query(FoodType).join(FoodType.properties, isouter=True)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                FoodType.name.ilike(term),
                FoodType.code.ilike(term),
                FoodType.description.ilike(term)
            )
        )

    if category_id:
        query = query.filter(FoodType.category_id == category_id)

    if physical_state and physical_state != "All":
        query = query.filter(FoodType.physical_state == physical_state)

    if moisture_level and moisture_level != "All":
        query = query.filter(FoodProperty.moisture_level == moisture_level)

    if oxygen_sensitivity and oxygen_sensitivity != "All":
        query = query.filter(FoodProperty.oxygen_sensitivity == oxygen_sensitivity)

    if spoilage_risk and spoilage_risk != "All":
        query = query.filter(FoodProperty.spoilage_risk == spoilage_risk)

    if storage_temp and storage_temp != "All":
        query = query.filter(FoodProperty.storage_temperature.ilike(f"%{storage_temp}%"))

    total = query.count()

    # Sorting
    if sort_by == "code":
        order_col = FoodType.code
    elif sort_by == "category":
        order_col = FoodType.category_id
    else:
        order_col = FoodType.name

    if sort_order == "desc":
        query = query.order_by(order_col.desc())
    else:
        query = query.order_by(order_col.asc())

    foods = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for f in foods:
        cand_summary = None
        if f.compatibilities:
            cand_summary = f.compatibilities[0].packaging_option.name if f.compatibilities[0].packaging_option else None

        items.append(FoodTypeSummary(
            id=f.id,
            code=f.code,
            name=f.name,
            category_id=f.category_id,
            category_name=f.category.name if f.category else "General",
            physical_state=f.physical_state,
            moisture_level=f.properties.moisture_level if f.properties else None,
            oxygen_sensitivity=f.properties.oxygen_sensitivity if f.properties else None,
            spoilage_risk=f.properties.spoilage_risk if f.properties else None,
            validation_priority=f.validation_priority,
            candidate_summary=cand_summary
        ))

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0
    }

@router.get("/{food_id}", response_model=FoodTypeDetail)
def get_food_detail(food_id: int, db: Session = Depends(get_db)):
    food = db.query(FoodType).filter(FoodType.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food product not found")
    return food
