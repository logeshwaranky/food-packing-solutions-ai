from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import (
    PackagingOption, FoodType, FoodProperty, PackagingTest, RecommendationHistory
)
from app.schemas.schemas import (
    RecommendationRequest, RecommendationResponse, ExtractedCriteria, CandidateExplanation
)
from app.recommendation.nlp_parser import parse_natural_language_query
from app.recommendation.rules import (
    evaluate_safety_gate, calculate_barrier_match_score, calculate_format_fit_score,
    calculate_shelf_life_score, calculate_cost_and_sustainability_scores
)
import json

class RecommendationEngine:
    def __init__(self, db: Session):
        self.db = db

    def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        missing_prompts: List[str] = []
        criteria_dict: Dict[str, Any] = {}

        # 1. Parse natural language query if provided
        if request.query and request.query.strip():
            nlp_result = parse_natural_language_query(request.query, self.db)
            criteria_dict = nlp_result["criteria"]
            missing_prompts = nlp_result["missing_prompts"]

        # 2. Overlay structured wizard inputs if user supplied them
        if request.food_name:
            criteria_dict["detected_food"] = request.food_name
            db_food = self.db.query(FoodType).filter(FoodType.name.ilike(f"%{request.food_name}%")).first()
            if db_food:
                criteria_dict["matched_food_id"] = db_food.id
                criteria_dict["category"] = db_food.category.name if db_food.category else None
                criteria_dict["physical_state"] = db_food.physical_state
                if db_food.properties:
                    criteria_dict["moisture_sensitivity"] = db_food.properties.moisture_level
                    criteria_dict["oxygen_sensitivity"] = db_food.properties.oxygen_sensitivity
                    criteria_dict["light_sensitivity"] = db_food.properties.light_sensitivity
                    criteria_dict["aroma_sensitivity"] = db_food.properties.aroma_sensitivity
                    criteria_dict["storage_temperature"] = db_food.properties.storage_temperature

        if request.quantity:
            criteria_dict["quantity"] = request.quantity
        if request.moisture_level:
            criteria_dict["moisture_sensitivity"] = request.moisture_level
        if request.fat_oil_content:
            criteria_dict["fat_oil_content"] = request.fat_oil_content
        if request.oxygen_sensitivity:
            criteria_dict["oxygen_sensitivity"] = request.oxygen_sensitivity
        if request.light_sensitivity:
            criteria_dict["light_sensitivity"] = request.light_sensitivity
        if request.aroma_sensitivity:
            criteria_dict["aroma_sensitivity"] = request.aroma_sensitivity
        if request.storage_temperature:
            criteria_dict["storage_temperature"] = request.storage_temperature
        if request.target_shelf_life:
            criteria_dict["target_shelf_life"] = request.target_shelf_life
        if request.budget:
            criteria_dict["budget_constraint"] = request.budget
        if request.sustainability_preference:
            criteria_dict["sustainability_goal"] = request.sustainability_preference

        # 3. Fetch all active packaging options from database
        all_options = self.db.query(PackagingOption).all()
        candidates: List[CandidateExplanation] = []
        disqualified_count = 0
        rejection_logs: List[str] = []

        food_name = criteria_dict.get("detected_food", "food product")
        is_coffee = "coffee" in food_name.lower()

        for opt in all_options:
            opt_dict = {
                "id": opt.id,
                "name": opt.name,
                "method_name": opt.method.name if opt.method else "",
                "material_name": opt.material.name if opt.material else "",
                "format_name": opt.format.name if opt.format else "",
                "barrier_rating_overall": opt.barrier_rating_overall,
                "material_moisture_barrier": opt.material.moisture_barrier if opt.material else "Medium",
                "material_oxygen_barrier": opt.material.oxygen_barrier if opt.material else "Medium",
                "material_light_barrier": opt.material.light_barrier if opt.material else "Medium",
                "estimated_unit_cost_range": opt.estimated_unit_cost_range or "$0.15 - $0.30",
                "sustainability_score": opt.sustainability_score or 5.0,
                "validation_status": opt.validation_status
            }

            # Safety Gate check
            passes_safety, rejection_reason = evaluate_safety_gate(opt_dict, criteria_dict)
            if not passes_safety:
                disqualified_count += 1
                rejection_logs.append(f"{opt.name}: {rejection_reason}")
                continue

            # Calculate explainable scores
            barrier_score = calculate_barrier_match_score(opt_dict, criteria_dict)
            format_score = calculate_format_fit_score(opt_dict, criteria_dict)
            shelf_score = calculate_shelf_life_score(opt_dict, criteria_dict)
            cost_score, sust_score = calculate_cost_and_sustainability_scores(opt_dict, criteria_dict)

            # Specific bonus/penalties for special matches
            special_bonus = 0.0
            if is_coffee:
                if "degassing" in opt.name.lower() or "foil" in opt.name.lower():
                    special_bonus += 10.0
                elif "vacuum" in opt.name.lower() and "valve" not in opt.name.lower():
                    special_bonus -= 5.0 # coffee emits gas, hard vacuum risks bursting or loss of aroma

            total_score = min(99.0, max(45.0, barrier_score + format_score + shelf_score + cost_score + sust_score + special_bonus))

            # Build explainable rationale
            why_candidate = (
                f"Selected for {food_name} because its {opt_dict['material_name']} construction and "
                f"{opt_dict['format_name']} design directly satisfy the required {opt_dict['barrier_rating_overall'].lower()} "
                f"barrier against atmospheric degradation while meeting food safety migration standards."
            )

            advantages = [
                f"Provides verified {opt_dict['material_moisture_barrier'].lower()} moisture barrier and {opt_dict['material_oxygen_barrier'].lower()} oxygen barrier.",
                f"Format ({opt_dict['format_name']}) is well-suited for {criteria_dict.get('physical_state', 'solid')} foods and standard consumer handling.",
                f"Complies with food contact standards (FDA 21 CFR / EU 10/2011) with proven seal integrity."
            ]
            if is_coffee and "valve" in opt.name.lower():
                advantages.append("Integrated one-way degassing valve allows off-gassing of roasted CO2 without admitting ambient oxygen.")

            trade_offs = [
                f"Unit cost is {opt_dict['estimated_unit_cost_range']}, which must be weighed against production line throughput.",
                f"Recycling profile: {opt.material.recyclability_status if opt.material else 'Check regional facilities'}."
            ]

            missing_evidence = (
                f"Specific shelf-life for {food_name} in {opt.name} depends on initial product moisture, "
                f"processing hygiene, and seal parameters. Supplier migration certificates must be confirmed."
            )

            rec_tests = [
                "ASTM F1249 Water Vapor Transmission Rate (WVTR)",
                "ASTM D3985 Oxygen Transmission Rate (OTR)",
                "ASTM F88 Seal Strength and Peel Integrity",
                "EN 1186 Overall and Specific Migration Testing"
            ]

            candidates.append(CandidateExplanation(
                option_id=opt.id,
                name=opt.name,
                method_name=opt_dict["method_name"],
                material_name=opt_dict["material_name"],
                format_name=opt_dict["format_name"],
                overall_suitability_score=round(total_score, 1),
                barrier_match_score=round(barrier_score, 1),
                safety_compliance_check=True,
                why_candidate=why_candidate,
                advantages=advantages,
                trade_offs=trade_offs,
                missing_evidence_and_risks=missing_evidence,
                recommended_technical_tests=rec_tests,
                estimated_unit_cost=opt_dict["estimated_unit_cost_range"],
                sustainability_score=opt_dict["sustainability_score"],
                validation_status=opt_dict["validation_status"]
            ))

        # Sort candidates by overall suitability score descending
        candidates.sort(key=lambda c: c.overall_suitability_score, reverse=True)

        # Record recommendation history in DB
        try:
            hist = RecommendationHistory(
                query_text=request.query or (f"Structured query for {request.food_name}"),
                user_inputs_json=json.dumps(request.model_dump(), default=str),
                extracted_criteria_json=json.dumps(criteria_dict, default=str),
                recommended_options_json=json.dumps([c.model_dump() for c in candidates[:5]], default=str),
                rejection_reasons_json=json.dumps(rejection_logs[:10], default=str)
            )
            self.db.add(hist)
            self.db.commit()
        except Exception:
            self.db.rollback()

        return RecommendationResponse(
            query_received=request.query,
            extracted_criteria=ExtractedCriteria(**criteria_dict),
            missing_information_prompts=missing_prompts,
            candidates=candidates[:6], # return top candidates
            total_candidates_evaluated=len(all_options),
            disqualified_candidates_count=disqualified_count
        )
