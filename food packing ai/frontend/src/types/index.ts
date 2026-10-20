export interface FoodCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  typical_spoilage_risks?: string;
  display_order: number;
  food_count: number;
}

export interface FoodProperty {
  moisture_level?: string;
  moisture_content_pct?: number;
  water_activity_aw?: number;
  oil_fat_content?: string;
  ph_level?: number;
  oxygen_sensitivity?: string;
  light_sensitivity?: string;
  aroma_sensitivity?: string;
  respiration_rate?: string;
  spoilage_risk?: string;
  storage_temperature?: string;
  target_shelf_life_note?: string;
  storage_handling_note?: string;
  spoilage_mechanisms?: string;
}

export interface PackagingRequirement {
  requirements_text: string;
  barrier_needs?: string;
  special_features?: string;
}

export interface PackagingMaterial {
  id: number;
  code: string;
  name: string;
  format_type?: string;
  moisture_barrier?: string;
  oxygen_barrier?: string;
  light_barrier?: string;
  grease_barrier?: string;
  thermal_tolerance?: string;
  recyclability_status?: string;
  typical_examples?: string;
  design_validation_note?: string;
  food_contact_approved: boolean;
}

export interface PackagingFormat {
  id: number;
  name: string;
  description?: string;
  suitable_states?: string;
  typical_closure?: string;
}

export interface PackagingMethod {
  id: number;
  code: string;
  name: string;
  category?: string;
  how_it_works: string;
  food_applications: string;
  food_protection_mechanism: string;
  advantages: string;
  limitations: string;
  cost_category?: string;
  environmental_considerations?: string;
  equipment_requirements?: string;
  storage_transport_suitability?: string;
  safety_validation_requirements?: string;
  is_process_vs_material: boolean;
}

export interface PackagingOption {
  id: number;
  name: string;
  description?: string;
  estimated_unit_cost_range?: string;
  barrier_rating_overall?: string;
  sustainability_score?: number;
  equipment_complexity?: string;
  typical_applications?: string;
  validation_status: string;
  method?: PackagingMethod;
  material?: PackagingMaterial;
  format?: PackagingFormat;
}

export interface FoodPackagingCompatibility {
  id: number;
  compatibility_level: string;
  suitability_score: number;
  reasons?: string;
  key_advantages?: string;
  critical_limitations?: string;
  required_tests?: string;
  evidence_level?: string;
  validation_status: string;
  packaging_option?: PackagingOption;
}

export interface FoodTypeSummary {
  id: number;
  code: string;
  name: string;
  category_id: number;
  category_name?: string;
  physical_state?: string;
  moisture_level?: string;
  oxygen_sensitivity?: string;
  spoilage_risk?: string;
  validation_priority?: string;
  candidate_summary?: string;
}

export interface FoodTypeDetail {
  id: number;
  code: string;
  name: string;
  category: FoodCategory;
  physical_state?: string;
  description?: string;
  image_url?: string;
  validation_priority?: string;
  properties?: FoodProperty;
  packaging_requirements?: PackagingRequirement;
  compatibilities: FoodPackagingCompatibility[];
}

export interface ExtractedCriteria {
  detected_food?: string;
  matched_food_id?: number;
  category?: string;
  quantity?: string;
  physical_state?: string;
  moisture_sensitivity?: string;
  oxygen_sensitivity?: string;
  light_sensitivity?: string;
  aroma_sensitivity?: string;
  storage_temperature?: string;
  target_shelf_life?: string;
  budget_constraint?: string;
  sustainability_goal?: string;
}

export interface CandidateExplanation {
  option_id: number;
  name: string;
  method_name: string;
  material_name: string;
  format_name: string;
  overall_suitability_score: number;
  barrier_match_score: number;
  safety_compliance_check: boolean;
  why_candidate: string;
  advantages: string[];
  trade_offs: string[];
  missing_evidence_and_risks: string;
  recommended_technical_tests: string[];
  estimated_unit_cost?: string;
  sustainability_score?: number;
  validation_status: string;
}

export interface RecommendationResponse {
  query_received?: string;
  extracted_criteria: ExtractedCriteria;
  missing_information_prompts: string[];
  candidates: CandidateExplanation[];
  total_candidates_evaluated: number;
  disqualified_candidates_count: number;
  regulatory_disclaimer: string;
}

export interface ProtectionGuide {
  id: string;
  title: string;
  icon: string;
  causes: string;
  effects_on_food: string;
  packaging_properties: string;
  suitable_methods: string[];
  limitations: string;
  storage_handling_practices: string;
}

export interface ComparisonAttribute {
  attribute: string;
  values: Record<number, any>;
}

export interface ComparisonResponse {
  options: PackagingOption[];
  food_context?: FoodTypeSummary;
  comparison_matrix: ComparisonAttribute[];
  summary_verdict: string;
}

export interface AdminStats {
  total_foods: number;
  total_categories: number;
  total_packaging_methods: number;
  total_materials: number;
  total_options: number;
  total_tests: number;
  total_feedbacks: number;
  validation_status_breakdown: Record<string, number>;
}
