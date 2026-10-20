import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import FoodType, FoodCategory

def parse_natural_language_query(query: str, db: Session) -> Dict[str, Any]:
    text = query.lower()
    criteria: Dict[str, Any] = {
        "detected_food": None,
        "matched_food_id": None,
        "category": None,
        "quantity": None,
        "physical_state": None,
        "moisture_sensitivity": None,
        "oxygen_sensitivity": None,
        "light_sensitivity": None,
        "aroma_sensitivity": None,
        "storage_temperature": None,
        "target_shelf_life": None,
        "budget_constraint": None,
        "sustainability_goal": None
    }
    missing_prompts: List[str] = []

    # 1. Quantity extraction (e.g., 250 g, 500ml, 1 kg, 2 liters, 100 grams)
    qty_match = re.search(r'(\d+(?:\.\d+)?)\s*(kg|g|gm|grams|kilograms|ml|l|liters|litres|oz|lbs)', text)
    if qty_match:
        criteria["quantity"] = f"{qty_match.group(1)} {qty_match.group(2)}"

    # 2. Match food product against database
    foods = db.query(FoodType).all()
    matched_food = None
    longest_match_len = 0

    for f in foods:
        fname = f.name.lower()
        if fname in text and len(fname) > longest_match_len:
            matched_food = f
            longest_match_len = len(fname)
    
    # Keyword fallback if exact name not in text
    if not matched_food:
        keywords = {
            "coffee": "Ground coffee",
            "rice": "Cooked rice",
            "biryani": "Biryani",
            "milk": "Pasteurized milk",
            "apple": "Fresh whole apples",
            "chips": "Potato crisps / chips",
            "chicken": "Fresh poultry / chicken cuts",
            "fish": "Fresh fish fillets",
            "tea": "Black tea leaves",
            "curry": "Paneer butter masala / curry",
            "spices": "Ground turmeric powder",
            "honey": "Pure honey",
            "juice": "Fresh orange juice",
            "nuts": "Roasted salted almonds",
            "bread": "Sliced sandwich bread"
        }
        for kw, target_name in keywords.items():
            if kw in text:
                matched_food = db.query(FoodType).filter(FoodType.name.ilike(f"%{target_name}%")).first()
                if not matched_food:
                    matched_food = db.query(FoodType).filter(FoodType.name.ilike(f"%{kw}%")).first()
                if matched_food:
                    break

    if matched_food:
        criteria["detected_food"] = matched_food.name
        criteria["matched_food_id"] = matched_food.id
        criteria["category"] = matched_food.category.name if matched_food.category else None
        criteria["physical_state"] = matched_food.physical_state
        if matched_food.properties:
            criteria["moisture_sensitivity"] = matched_food.properties.moisture_level
            criteria["oxygen_sensitivity"] = matched_food.properties.oxygen_sensitivity
            criteria["light_sensitivity"] = matched_food.properties.light_sensitivity
            criteria["aroma_sensitivity"] = matched_food.properties.aroma_sensitivity
            criteria["storage_temperature"] = matched_food.properties.storage_temperature
    else:
        # Generic state inference from query
        if any(w in text for w in ["powder", "flour", "ground", "spice"]):
            criteria["physical_state"] = "Powder"
            criteria["detected_food"] = "Unspecified powder product"
        elif any(w in text for w in ["liquid", "beverage", "drink", "juice", "oil"]):
            criteria["physical_state"] = "Liquid"
            criteria["detected_food"] = "Unspecified liquid beverage"
        elif any(w in text for w in ["meat", "chicken", "beef", "pork"]):
            criteria["physical_state"] = "Fresh Meat"
            criteria["detected_food"] = "Unspecified fresh meat"
        else:
            criteria["detected_food"] = "Custom food formulation"

    # 3. Aroma sensitivity
    if any(w in text for w in ["aroma", "flavour", "flavor", "fragrance", "scent", "coffee", "tea", "spice"]):
        criteria["aroma_sensitivity"] = "High"

    # 4. Moisture sensitivity
    if any(w in text for w in ["moisture", "dry", "crisp", "crunchy", "humidity", "water"]):
        criteria["moisture_sensitivity"] = "High"

    # 5. Oxygen sensitivity
    if any(w in text for w in ["oxygen", "oxidation", "rancid", "fats", "lipid", "air tight", "hermetic"]):
        criteria["oxygen_sensitivity"] = "High"

    # 6. Light sensitivity
    if any(w in text for w in ["light", "sunlight", "uv", "dark", "photodegradation"]):
        criteria["light_sensitivity"] = "High"

    # 7. Temperature / Storage
    if any(w in text for w in ["frozen", "freezer", "-18"]):
        criteria["storage_temperature"] = "Frozen (-18°C)"
    elif any(w in text for w in ["chilled", "refrigerated", "fridge", "cold chain", "0-4"]):
        criteria["storage_temperature"] = "Refrigerated (0-4°C)"
    elif any(w in text for w in ["ambient", "room temperature", "shelf stable"]):
        criteria["storage_temperature"] = "Ambient (15-25°C)"

    # 8. Shelf Life
    if any(w in text for w in ["long shelf life", "year", "extended", "months", "2 years", "12 months"]):
        criteria["target_shelf_life"] = "Extended (>6-12 months)"
    elif any(w in text for w in ["fresh", "quick", "few days", "week", "daily"]):
        criteria["target_shelf_life"] = "Short (<7-14 days)"

    # 9. Budget
    if any(w in text for w in ["affordable", "cheap", "low cost", "budget", "economical"]):
        criteria["budget_constraint"] = "Economy / Affordable"
    elif any(w in text for w in ["premium", "luxury", "high end", "artisan"]):
        criteria["budget_constraint"] = "Premium"
    else:
        criteria["budget_constraint"] = "Balanced / Standard"

    # 10. Sustainability
    if any(w in text for w in ["eco", "compostable", "biodegradable", "sustainable", "green", "recyclable", "zero waste"]):
        criteria["sustainability_goal"] = "High (Recyclable / Compostable)"

    # Generate follow-up questions for critical missing information
    if not criteria["storage_temperature"]:
        if criteria["physical_state"] in ["Prepared Meal", "Fresh Meat", "Fresh Meat / Seafood"]:
            missing_prompts.append("What is your intended storage temperature? Chilled (0-4°C) or hot-holding (>60°C) is required for high-risk perishable items to prevent food poisoning.")
        else:
            missing_prompts.append("What is your expected storage temperature (e.g. ambient room temperature, chilled 4°C, or frozen -18°C)?")

    if not criteria["target_shelf_life"]:
        missing_prompts.append("What is your target shelf life (e.g. 3-5 days delivery, 3 months retail distribution, or 12+ months ambient)?")

    if not criteria["quantity"]:
        missing_prompts.append("What is your target package net weight or volume (e.g., 250 g, 500 ml, 1 kg)?")

    return {
        "criteria": criteria,
        "missing_prompts": missing_prompts
    }
