from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)
    license = Column(String(100), nullable=True)
    dataset_type = Column(String(100), nullable=True)
    version = Column(String(50), default="1.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    food_types = relationship("FoodType", back_populates="data_source")
    compatibilities = relationship("FoodPackagingCompatibility", back_populates="data_source")


class RegulatoryReference(Base):
    __tablename__ = "regulatory_references"

    id = Column(Integer, primary_key=True, index=True)
    jurisdiction = Column(String(100), nullable=False) # e.g., US FDA, EU EFSA, FSSAI, ISO
    standard_code = Column(String(100), nullable=False) # e.g., 21 CFR 177.1520, EU 10/2011
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    doc_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    materials = relationship("PackagingMaterial", back_populates="regulatory_ref")


class FoodCategory(Base):
    __tablename__ = "food_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    typical_spoilage_risks = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    foods = relationship("FoodType", back_populates="category")


class FoodType(Base):
    __tablename__ = "food_types"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. F001
    name = Column(String(200), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("food_categories.id"), nullable=False)
    physical_state = Column(String(100), nullable=True) # Solid, Liquid, Powder, Granular, Viscous, Perishable Fresh, Frozen
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    validation_priority = Column(String(50), default="Medium") # High, Medium, Low
    data_source_id = Column(Integer, ForeignKey("data_sources.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("FoodCategory", back_populates="foods")
    data_source = relationship("DataSource", back_populates="food_types")
    properties = relationship("FoodProperty", back_populates="food", uselist=False, cascade="all, delete-orphan")
    packaging_requirements = relationship("PackagingRequirement", back_populates="food", uselist=False, cascade="all, delete-orphan")
    compatibilities = relationship("FoodPackagingCompatibility", back_populates="food", cascade="all, delete-orphan")


class FoodProperty(Base):
    __tablename__ = "food_properties"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("food_types.id"), unique=True, nullable=False)
    moisture_level = Column(String(50), nullable=True) # High, Medium, Low
    moisture_content_pct = Column(Float, nullable=True)
    water_activity_aw = Column(Float, nullable=True)
    oil_fat_content = Column(String(50), nullable=True) # High, Medium, Low
    ph_level = Column(Float, nullable=True)
    oxygen_sensitivity = Column(String(50), nullable=True) # High, Medium, Low
    light_sensitivity = Column(String(50), nullable=True) # High, Medium, Low
    aroma_sensitivity = Column(String(50), nullable=True) # High, Medium, Low
    respiration_rate = Column(String(50), nullable=True) # High, Medium, Low, None
    spoilage_risk = Column(String(50), nullable=True) # High, Medium, Low
    storage_temperature = Column(String(100), nullable=True) # Room Temp, Refrigerated 0-4°C, Frozen -18°C, Hot Holding
    target_shelf_life_note = Column(String(255), nullable=True)
    storage_handling_note = Column(Text, nullable=True)
    spoilage_mechanisms = Column(Text, nullable=True) # JSON or comma-separated

    food = relationship("FoodType", back_populates="properties")


class PackagingMethod(Base):
    __tablename__ = "packaging_methods"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True) # e.g. METH01
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=True) # e.g. Atmospheric, Thermal, Physical, Active/Smart
    how_it_works = Column(Text, nullable=False)
    food_applications = Column(Text, nullable=False)
    food_protection_mechanism = Column(Text, nullable=False)
    advantages = Column(Text, nullable=False)
    limitations = Column(Text, nullable=False)
    cost_category = Column(String(50), nullable=True) # Low, Medium, High, Capital-Intensive
    environmental_considerations = Column(Text, nullable=True)
    equipment_requirements = Column(Text, nullable=True)
    storage_transport_suitability = Column(Text, nullable=True)
    safety_validation_requirements = Column(Text, nullable=True)
    is_process_vs_material = Column(Boolean, default=True) # True = Method/Process, False = Material
    created_at = Column(DateTime, default=datetime.utcnow)

    options = relationship("PackagingOption", back_populates="method")


class PackagingMaterial(Base):
    __tablename__ = "packaging_materials"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True) # e.g. M001
    name = Column(String(200), nullable=False, index=True) # e.g. Glass, PET, HDPE, PP, EVOH, etc.
    format_type = Column(String(100), nullable=True) # Rigid container, Flexible plastic, Multilayer film
    moisture_barrier = Column(String(50), nullable=True) # High, Medium, Low
    oxygen_barrier = Column(String(50), nullable=True) # High, Medium, Low
    light_barrier = Column(String(50), nullable=True) # High, Medium, Low
    grease_barrier = Column(String(50), nullable=True) # High, Medium, Low
    thermal_tolerance = Column(String(100), nullable=True) # e.g. -20°C to 120°C
    recyclability_status = Column(String(255), nullable=True)
    typical_examples = Column(Text, nullable=True)
    design_validation_note = Column(Text, nullable=True)
    food_contact_approved = Column(Boolean, default=True)
    regulatory_ref_id = Column(Integer, ForeignKey("regulatory_references.id"), nullable=True)
    dataset_type = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    regulatory_ref = relationship("RegulatoryReference", back_populates="materials")
    options = relationship("PackagingOption", back_populates="material")
    tests = relationship("PackagingTest", back_populates="material")


class PackagingFormat(Base):
    __tablename__ = "packaging_formats"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True) # e.g. Stand-up Pouch, Clamshell, Canister
    description = Column(Text, nullable=True)
    suitable_states = Column(String(255), nullable=True) # Powder, Liquid, Solid
    typical_closure = Column(String(100), nullable=True) # Heat seal, screw cap, zipper
    created_at = Column(DateTime, default=datetime.utcnow)

    options = relationship("PackagingOption", back_populates="format")


class PackagingOption(Base):
    __tablename__ = "packaging_options"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    method_id = Column(Integer, ForeignKey("packaging_methods.id"), nullable=True)
    material_id = Column(Integer, ForeignKey("packaging_materials.id"), nullable=True)
    format_id = Column(Integer, ForeignKey("packaging_formats.id"), nullable=True)
    description = Column(Text, nullable=True)
    estimated_unit_cost_range = Column(String(100), nullable=True) # e.g. $0.05 - $0.15
    barrier_rating_overall = Column(String(50), default="Medium") # Low, Medium, High, Ultra-High
    sustainability_score = Column(Float, default=5.0) # 1.0 to 10.0
    equipment_complexity = Column(String(50), default="Moderate") # Low, Moderate, High, Industrial
    typical_applications = Column(Text, nullable=True)
    validation_status = Column(String(50), default="candidate") # candidate, tested, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    method = relationship("PackagingMethod", back_populates="options")
    material = relationship("PackagingMaterial", back_populates="options")
    format = relationship("PackagingFormat", back_populates="options")
    compatibilities = relationship("FoodPackagingCompatibility", back_populates="packaging_option")
    tests = relationship("PackagingTest", back_populates="packaging_option")


class PackagingRequirement(Base):
    __tablename__ = "packaging_requirements"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("food_types.id"), unique=True, nullable=False)
    requirements_text = Column(Text, nullable=False)
    barrier_needs = Column(Text, nullable=True) # JSON or descriptive string
    special_features = Column(Text, nullable=True) # Degassing valve, UV blocking, Tamper evident, Modified Atmosphere

    food = relationship("FoodType", back_populates="packaging_requirements")


class FoodPackagingCompatibility(Base):
    __tablename__ = "food_packaging_compatibility"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("food_types.id"), nullable=False)
    packaging_option_id = Column(Integer, ForeignKey("packaging_options.id"), nullable=False)
    compatibility_level = Column(String(50), default="Compatible") # Highly Recommended, Compatible, Conditionally Compatible, Incompatible
    suitability_score = Column(Float, default=80.0) # 0 to 100
    reasons = Column(Text, nullable=True)
    key_advantages = Column(Text, nullable=True)
    critical_limitations = Column(Text, nullable=True)
    required_tests = Column(Text, nullable=True)
    evidence_level = Column(String(100), default="Seed Expert Label") # Seed Expert Label, Lab Tested, Regulatory Standard
    validation_status = Column(String(50), default="candidate") # candidate, tested, approved, rejected
    data_source_id = Column(Integer, ForeignKey("data_sources.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    food = relationship("FoodType", back_populates="compatibilities")
    packaging_option = relationship("PackagingOption", back_populates="compatibilities")
    data_source = relationship("DataSource", back_populates="compatibilities")


class PackagingTest(Base):
    __tablename__ = "packaging_tests"

    id = Column(Integer, primary_key=True, index=True)
    packaging_option_id = Column(Integer, ForeignKey("packaging_options.id"), nullable=True)
    material_id = Column(Integer, ForeignKey("packaging_materials.id"), nullable=True)
    test_name = Column(String(200), nullable=False) # e.g. ASTM F1249 WVTR, ASTM D3985 OTR
    test_standard = Column(String(100), nullable=True) # e.g. ASTM, ISO, EN
    methodology = Column(Text, nullable=True)
    pass_criteria = Column(Text, nullable=True)
    result_notes = Column(Text, nullable=True)
    status = Column(String(50), default="passed") # passed, failed, pending, required
    tested_at = Column(DateTime, default=datetime.utcnow)

    packaging_option = relationship("PackagingOption", back_populates="tests")
    material = relationship("PackagingMaterial", back_populates="tests")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=True)
    role = Column(String(50), default="user") # admin, packaging_specialist, user
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(Text, nullable=True)
    user_inputs_json = Column(Text, nullable=True)
    extracted_criteria_json = Column(Text, nullable=True)
    recommended_options_json = Column(Text, nullable=True)
    rejection_reasons_json = Column(Text, nullable=True)
    session_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    feedbacks = relationship("UserFeedback", back_populates="recommendation")


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendation_history.id"), nullable=True)
    rating = Column(Integer, nullable=False) # 1 to 5
    comments = Column(Text, nullable=True)
    selected_packaging_id = Column(Integer, ForeignKey("packaging_options.id"), nullable=True)
    user_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    recommendation = relationship("RecommendationHistory", back_populates="feedbacks")
