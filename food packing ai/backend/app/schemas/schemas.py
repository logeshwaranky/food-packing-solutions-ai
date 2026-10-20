from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

# --- Auth & User ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: Optional[str] = None
    role: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "user"

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Regulatory & Sources ---
class RegulatoryReferenceOut(BaseModel):
    id: int
    jurisdiction: str
    standard_code: str
    title: str
    summary: Optional[str] = None
    doc_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DataSourceOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    license: Optional[str] = None
    dataset_type: Optional[str] = None
    version: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Packaging Materials & Methods & Formats ---
class PackagingMaterialOut(BaseModel):
    id: int
    code: str
    name: str
    format_type: Optional[str] = None
    moisture_barrier: Optional[str] = None
    oxygen_barrier: Optional[str] = None
    light_barrier: Optional[str] = None
    grease_barrier: Optional[str] = None
    thermal_tolerance: Optional[str] = None
    recyclability_status: Optional[str] = None
    typical_examples: Optional[str] = None
    design_validation_note: Optional[str] = None
    food_contact_approved: bool

    model_config = ConfigDict(from_attributes=True)

class PackagingFormatOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    suitable_states: Optional[str] = None
    typical_closure: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PackagingMethodOut(BaseModel):
    id: int
    code: str
    name: str
    category: Optional[str] = None
    how_it_works: str
    food_applications: str
    food_protection_mechanism: str
    advantages: str
    limitations: str
    cost_category: Optional[str] = None
    environmental_considerations: Optional[str] = None
    equipment_requirements: Optional[str] = None
    storage_transport_suitability: Optional[str] = None
    safety_validation_requirements: Optional[str] = None
    is_process_vs_material: bool

    model_config = ConfigDict(from_attributes=True)

class PackagingTestOut(BaseModel):
    id: int
    test_name: str
    test_standard: Optional[str] = None
    methodology: Optional[str] = None
    pass_criteria: Optional[str] = None
    result_notes: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)

class PackagingOptionOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    estimated_unit_cost_range: Optional[str] = None
    barrier_rating_overall: Optional[str] = None
    sustainability_score: Optional[float] = None
    equipment_complexity: Optional[str] = None
    typical_applications: Optional[str] = None
    validation_status: str
    method: Optional[PackagingMethodOut] = None
    material: Optional[PackagingMaterialOut] = None
    format: Optional[PackagingFormatOut] = None

    model_config = ConfigDict(from_attributes=True)

# --- Food Categories & Properties ---
class FoodCategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    typical_spoilage_risks: Optional[str] = None
    display_order: int
    food_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class FoodPropertyOut(BaseModel):
    moisture_level: Optional[str] = None
    moisture_content_pct: Optional[float] = None
    water_activity_aw: Optional[float] = None
    oil_fat_content: Optional[str] = None
    ph_level: Optional[float] = None
    oxygen_sensitivity: Optional[str] = None
    light_sensitivity: Optional[str] = None
    aroma_sensitivity: Optional[str] = None
    respiration_rate: Optional[str] = None
    spoilage_risk: Optional[str] = None
    storage_temperature: Optional[str] = None
    target_shelf_life_note: Optional[str] = None
    storage_handling_note: Optional[str] = None
    spoilage_mechanisms: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PackagingRequirementOut(BaseModel):
    requirements_text: str
    barrier_needs: Optional[str] = None
    special_features: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class FoodPackagingCompatibilityOut(BaseModel):
    id: int
    compatibility_level: str
    suitability_score: float
    reasons: Optional[str] = None
    key_advantages: Optional[str] = None
    critical_limitations: Optional[str] = None
    required_tests: Optional[str] = None
    evidence_level: Optional[str] = None
    validation_status: str
    packaging_option: Optional[PackagingOptionOut] = None

    model_config = ConfigDict(from_attributes=True)

class FoodTypeSummary(BaseModel):
    id: int
    code: str
    name: str
    category_id: int
    category_name: Optional[str] = None
    physical_state: Optional[str] = None
    moisture_level: Optional[str] = None
    oxygen_sensitivity: Optional[str] = None
    spoilage_risk: Optional[str] = None
    validation_priority: Optional[str] = None
    candidate_summary: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class FoodTypeDetail(BaseModel):
    id: int
    code: str
    name: str
    category: FoodCategoryOut
    physical_state: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    validation_priority: Optional[str] = None
    properties: Optional[FoodPropertyOut] = None
    packaging_requirements: Optional[PackagingRequirementOut] = None
    compatibilities: List[FoodPackagingCompatibilityOut] = []
    data_source: Optional[DataSourceOut] = None

    model_config = ConfigDict(from_attributes=True)

class FoodTypeCreate(BaseModel):
    code: str
    name: str
    category_id: int
    physical_state: Optional[str] = "Solid"
    description: Optional[str] = None
    validation_priority: Optional[str] = "Medium"
    moisture_level: Optional[str] = "Medium"
    oxygen_sensitivity: Optional[str] = "Medium"
    spoilage_risk: Optional[str] = "Medium"
    storage_temperature: Optional[str] = "Ambient"
    storage_handling_note: Optional[str] = None
    packaging_requirements: Optional[str] = "Food-contact safe packaging"
    packaging_option_id: Optional[int] = None

# --- AI Recommendation Engine Schemas ---
class RecommendationRequest(BaseModel):
    query: Optional[str] = None # e.g. "I want to pack 250 g of coffee powder. It should retain its aroma, remain protected from moisture and oxygen, and be affordable."
    # Structured wizard inputs (optional if query is given)
    food_name: Optional[str] = None
    category_id: Optional[int] = None
    quantity: Optional[str] = None # e.g. "250 g"
    package_size: Optional[str] = None # e.g. "Single-serve", "Family pack", "Bulk"
    moisture_level: Optional[str] = None # "High", "Medium", "Low"
    fat_oil_content: Optional[str] = None # "High", "Medium", "Low"
    oxygen_sensitivity: Optional[str] = None # "High", "Medium", "Low"
    light_sensitivity: Optional[str] = None # "High", "Medium", "Low"
    aroma_sensitivity: Optional[str] = None # "High", "Medium", "Low"
    storage_temperature: Optional[str] = None # "Ambient", "Refrigerated (0-4°C)", "Frozen (-18°C)"
    target_shelf_life: Optional[str] = None # "Short (<7 days)", "Medium (1-6 months)", "Extended (1-2 years)"
    distribution_conditions: Optional[str] = None # "Local delivery", "Ambient retail", "Cold chain freight", "Export"
    budget: Optional[str] = None # "Economy / Low", "Standard / Balanced", "Premium"
    sustainability_preference: Optional[str] = None # "Standard", "High (Recyclable/Compostable)", "Zero Waste"

class ExtractedCriteria(BaseModel):
    detected_food: Optional[str] = None
    matched_food_id: Optional[int] = None
    category: Optional[str] = None
    quantity: Optional[str] = None
    physical_state: Optional[str] = None
    moisture_sensitivity: Optional[str] = None
    oxygen_sensitivity: Optional[str] = None
    light_sensitivity: Optional[str] = None
    aroma_sensitivity: Optional[str] = None
    storage_temperature: Optional[str] = None
    target_shelf_life: Optional[str] = None
    budget_constraint: Optional[str] = None
    sustainability_goal: Optional[str] = None

class CandidateExplanation(BaseModel):
    option_id: int
    name: str
    method_name: str
    material_name: str
    format_name: str
    overall_suitability_score: float
    barrier_match_score: float
    safety_compliance_check: bool # Passed mandatory food-contact compliance gate
    why_candidate: str
    advantages: List[str]
    trade_offs: List[str]
    missing_evidence_and_risks: str
    recommended_technical_tests: List[str]
    estimated_unit_cost: Optional[str] = None
    sustainability_score: Optional[float] = None
    validation_status: str

class RecommendationResponse(BaseModel):
    query_received: Optional[str] = None
    extracted_criteria: ExtractedCriteria
    missing_information_prompts: List[str] = [] # Clarification questions if key info was omitted
    candidates: List[CandidateExplanation]
    total_candidates_evaluated: int
    disqualified_candidates_count: int
    regulatory_disclaimer: str = (
        "Notice: Recommendations provided by Food Packing Solutions AI are decision-support candidates "
        "derived from packaging engineering rules and seed data. They do not constitute formal legal certification "
        "or guaranteed shelf-life. Final packaging systems must undergo physical migration testing (e.g. EN 1186), "
        "barrier permeation validation (ASTM D3985/F1249), and formal HACCP food safety qualification."
    )

# --- Packaging Comparison ---
class ComparisonRequest(BaseModel):
    packaging_option_ids: List[int] = Field(..., min_length=2, max_length=4)
    food_id: Optional[int] = None

class ComparisonAttribute(BaseModel):
    attribute: str
    values: Dict[int, Any] # option_id -> value

class ComparisonResponse(BaseModel):
    options: List[PackagingOptionOut]
    food_context: Optional[FoodTypeSummary] = None
    comparison_matrix: List[ComparisonAttribute]
    summary_verdict: str

# --- User Feedback ---
class FeedbackCreate(BaseModel):
    recommendation_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None
    selected_packaging_id: Optional[int] = None
    user_email: Optional[str] = None

class FeedbackOut(BaseModel):
    id: int
    rating: int
    comments: Optional[str] = None
    user_email: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Admin Statistics ---
class AdminStatsOut(BaseModel):
    total_foods: int
    total_categories: int
    total_packaging_methods: int
    total_materials: int
    total_options: int
    total_tests: int
    total_feedbacks: int
    validation_status_breakdown: Dict[str, int]
