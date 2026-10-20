from typing import Dict, Any, Tuple, Optional, List

def evaluate_safety_gate(option_dict: Dict[str, Any], criteria: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Mandatory Safety and Food Contact Compliance Gate.
    Returns (True, None) if candidate passes safety prerequisites, or (False, rejection_reason).
    Cost, convenience, or sustainability scoring CANNOT override safety failure.
    """
    state = (criteria.get("physical_state") or "").lower()
    food_name = (criteria.get("detected_food") or "").lower()
    method_name = (option_dict.get("method_name") or "").lower()
    format_name = (option_dict.get("format_name") or "").lower()
    material_name = (option_dict.get("material_name") or "").lower()
    temp = (criteria.get("storage_temperature") or "").lower()
    shelf_life = (criteria.get("target_shelf_life") or "").lower()

    # Rule 1: Liquids cannot be packed in unlined paperboard or mesh bags
    if "liquid" in state:
        if "mesh" in format_name or "moulded fibre" in format_name:
            return False, "Disqualified: Porous mesh or unlined paperboard cannot contain liquid food products."
        if "paperboard" in material_name and "aseptic" not in format_name and "barrier" not in format_name:
            return False, "Disqualified: Unlined paperboard will soften, lose structural integrity, and leak liquids."

    # Rule 2: Fresh respiring produce cannot be packaged under hard vacuum
    if "produce" in state or "apple" in food_name or "banana" in food_name or "tomato" in food_name:
        if "vacuum" in method_name or "vacuum" in format_name:
            return False, "Disqualified: Whole respiring produce requires gas exchange (aerobic respiration). High vacuum creates anaerobic conditions triggering tissue death, fermentation, and rapid decay."

    # Rule 3: Ambient shelf-stable high-moisture perishable food requires thermal sterilization (Retort or Aseptic)
    if ("meal" in state or "meat" in state or "rice" in food_name or "curry" in food_name) and "ambient" in temp and "extended" in shelf_life:
        if "retort" not in method_name and "aseptic" not in method_name and "can" not in format_name:
            return False, "Disqualified: High-moisture, low-acid perishable foods cannot be held at ambient room temperature for extended periods without commercial sterilization (Retort or Aseptic) due to fatal Clostridium botulinum risk."

    # Rule 4: High acid foods (pickles, tomato sauce) in unlacquered metal
    if ("pickle" in food_name or "tomato" in food_name or "citrus" in food_name) and "metal" in method_name:
        if "lacquer" not in option_dict.get("name", "").lower() and "bpa-ni" not in option_dict.get("name", "").lower():
            return False, "Disqualified: Acidic foods (pH < 4.5) will corrode bare metal substrates, causing heavy metal migration and pinhole leakers."

    # Rule 5: Hot takeaway food in un-stabilized low-temperature plastic
    if "hot" in temp and ("ldpe" in material_name or "pet" in material_name):
        return False, "Disqualified: Standard LDPE or PET containers deform and risk chemical additive migration under high serving temperatures (>85°C). Polypropylene (PP) is mandatory for hot food contact."

    return True, None

def calculate_barrier_match_score(option_dict: Dict[str, Any], criteria: Dict[str, Any]) -> float:
    """Calculates gas, moisture, and aroma barrier adequacy (0 to 40 points)."""
    score = 25.0
    barrier_overall = option_dict.get("barrier_rating_overall", "Medium")
    material_moisture = option_dict.get("material_moisture_barrier", "Medium")
    material_oxygen = option_dict.get("material_oxygen_barrier", "Medium")
    material_light = option_dict.get("material_light_barrier", "Medium")

    moisture_sens = criteria.get("moisture_sensitivity") == "High"
    oxygen_sens = criteria.get("oxygen_sensitivity") == "High"
    aroma_sens = criteria.get("aroma_sensitivity") == "High"
    light_sens = criteria.get("light_sensitivity") == "High"

    if barrier_overall == "Ultra-High":
        score += 15.0
    elif barrier_overall == "High":
        score += 10.0
    elif barrier_overall == "Medium":
        score += 3.0
    else:
        score -= 10.0

    # Moisture match
    if moisture_sens:
        if material_moisture in ["High", "Ultra-High"]:
            score += 5.0
        elif material_moisture == "Low":
            score -= 15.0

    # Oxygen match
    if oxygen_sens:
        if material_oxygen in ["High", "Ultra-High"]:
            score += 5.0
        elif material_oxygen == "Low":
            score -= 15.0

    # Aroma retention match (e.g. coffee, spices)
    if aroma_sens:
        if "foil" in option_dict.get("name", "").lower() or "glass" in option_dict.get("name", "").lower() or "evoh" in option_dict.get("name", "").lower() or "can" in option_dict.get("name", "").lower():
            score += 5.0
        else:
            score -= 8.0

    # Light protection
    if light_sens:
        if material_light in ["High", "Ultra-High"] or "foil" in option_dict.get("name", "").lower() or "can" in option_dict.get("name", "").lower():
            score += 3.0

    return max(0.0, min(40.0, score))

def calculate_format_fit_score(option_dict: Dict[str, Any], criteria: Dict[str, Any]) -> float:
    """Calculates physical state and handling convenience match (0 to 25 points)."""
    score = 15.0
    state = (criteria.get("physical_state") or "").lower()
    format_name = (option_dict.get("format_name") or "").lower()

    if "powder" in state:
        if "pouch" in format_name or "can" in format_name or "jar" in format_name:
            score += 10.0
        elif "tray" in format_name:
            score -= 8.0
    elif "liquid" in state:
        if "carton" in format_name or "jar" in format_name or "can" in format_name or "bottle" in format_name:
            score += 10.0
        elif "tray" in format_name:
            score -= 5.0
    elif "prepared meal" in state or "meal" in state:
        if "container" in format_name or "bowl" in format_name or "tray" in format_name or "retort" in format_name:
            score += 10.0
    elif "produce" in state:
        if "box" in format_name or "moulded" in format_name or "mesh" in format_name:
            score += 10.0

    return max(0.0, min(25.0, score))

def calculate_shelf_life_score(option_dict: Dict[str, Any], criteria: Dict[str, Any]) -> float:
    """Calculates shelf-life compatibility (0 to 15 points)."""
    score = 10.0
    shelf_life = (criteria.get("target_shelf_life") or "").lower()
    method_name = (option_dict.get("method_name") or "").lower()

    if "extended" in shelf_life:
        if "retort" in method_name or "aseptic" in method_name or "metal" in method_name or "foil" in option_dict.get("name", "").lower():
            score += 5.0
        elif "flexible" in method_name and "foil" not in option_dict.get("name", "").lower():
            score -= 4.0
    elif "short" in shelf_life:
        if "flexible" in method_name or "rigid" in method_name or "container" in option_dict.get("name", "").lower():
            score += 5.0

    return max(0.0, min(15.0, score))

def calculate_cost_and_sustainability_scores(option_dict: Dict[str, Any], criteria: Dict[str, Any]) -> Tuple[float, float]:
    """Calculates budget alignment (0-10) and sustainability alignment (0-10)."""
    cost_score = 7.0
    sustainability_score = 7.0

    budget = criteria.get("budget_constraint") or ""
    cost_str = option_dict.get("estimated_unit_cost_range") or ""

    if "economy" in budget.lower() or "affordable" in budget.lower():
        if "$0.05" in cost_str or "$0.08" in cost_str or "$0.10" in cost_str:
            cost_score = 10.0
        elif "$0.30" in cost_str or "$0.70" in cost_str:
            cost_score = 4.0
    elif "premium" in budget.lower():
        cost_score = 8.5 # cost is less of a penalty

    sust_goal = criteria.get("sustainability_goal") or ""
    pack_sust = option_dict.get("sustainability_score", 5.0)

    if "high" in sust_goal.lower():
        sustainability_score = min(10.0, (pack_sust / 10.0) * 10.0)
    else:
        sustainability_score = 7.5

    return cost_score, sustainability_score
