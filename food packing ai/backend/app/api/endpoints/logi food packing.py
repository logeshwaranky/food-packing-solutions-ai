from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import PackagingOption, FoodType
from app.schemas.schemas import (
    ComparisonRequest, ComparisonResponse, ComparisonAttribute, PackagingOptionOut, FoodTypeSummary
)

router = APIRouter(prefix="/packaging", tags=["Packaging Comparison"])

@router.post("/compare", response_model=ComparisonResponse)
def compare_packaging_options(request: ComparisonRequest, db: Session = Depends(get_db)):
    if len(request.packaging_option_ids) < 2 or len(request.packaging_option_ids) > 4:
        raise HTTPException(status_code=400, detail="Please select between 2 and 4 packaging options to compare.")

    options = db.query(PackagingOption).filter(PackagingOption.id.in_(request.packaging_option_ids)).all()
    if len(options) != len(request.packaging_option_ids):
        raise HTTPException(status_code=404, detail="One or more selected packaging options were not found.")

    food_context = None
    if request.food_id:
        food = db.query(FoodType).filter(FoodType.id == request.food_id).first()
        if food:
            food_context = FoodTypeSummary(
                id=food.id,
                code=food.code,
                name=food.name,
                category_id=food.category_id,
                category_name=food.category.name if food.category else "",
                physical_state=food.physical_state,
                moisture_level=food.properties.moisture_level if food.properties else None,
                oxygen_sensitivity=food.properties.oxygen_sensitivity if food.properties else None,
                spoilage_risk=food.properties.spoilage_risk if food.properties else None,
                validation_priority=food.validation_priority
            )

    # Build comparison matrix attributes
    attributes_def = [
        ("Material & Substrate", lambda o: o.material.name if o.material else "N/A"),
        ("Packaging Format", lambda o: o.format.name if o.format else "N/A"),
        ("Packaging Method / Process", lambda o: o.method.name if o.method else "N/A"),
        ("Overall Barrier Rating", lambda o: o.barrier_rating_overall or "Medium"),
        ("Moisture Barrier", lambda o: o.material.moisture_barrier if o.material else "Unknown"),
        ("Oxygen Barrier", lambda o: o.material.oxygen_barrier if o.material else "Unknown"),
        ("Light Barrier", lambda o: o.material.light_barrier if o.material else "Unknown"),
        ("Estimated Unit Cost", lambda o: o.estimated_unit_cost_range or "Not specified"),
        ("Sustainability Score (1-10)", lambda o: f"{o.sustainability_score or 5.0} / 10"),
        ("Recyclability / End of Life", lambda o: o.material.recyclability_status if o.material else "Check local recycling"),
        ("Equipment Complexity", lambda o: o.equipment_complexity or "Moderate"),
        ("Validation & Evidence Status", lambda o: o.validation_status.title())
    ]

    matrix: List[ComparisonAttribute] = []
    for label, extractor in attributes_def:
        vals: Dict[int, Any] = {}
        for opt in options:
            vals[opt.id] = extractor(opt)
        matrix.append(ComparisonAttribute(attribute=label, values=vals))

    # Generate summary verdict
    verdict = (
        f"Compared {len(options)} solutions. "
        "High barrier needs favor multilayer foil or glass hermetic closures, while fast distribution and cost sensitivity "
        "favor recyclable PP containers or monomaterial pouches. Verify seal strength and migration limits prior to production."
    )

    return ComparisonResponse(
        options=[PackagingOptionOut.model_validate(o) for o in options],
        food_context=food_context,
        comparison_matrix=matrix,
        summary_verdict=verdict
    )
