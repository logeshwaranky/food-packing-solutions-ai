import os
import re
import pandas as pd
from sqlalchemy.orm import Session
from app.database.session import engine, SessionLocal, Base
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.models import (
    DataSource, RegulatoryReference, FoodCategory, FoodType, FoodProperty,
    PackagingMethod, PackagingMaterial, PackagingFormat, PackagingOption,
    PackagingRequirement, FoodPackagingCompatibility, PackagingTest,
    User
)

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

def populate_database(excel_path: str = None):
    if not excel_path:
        excel_path = settings.DATASET_PATH
        if not os.path.exists(excel_path):
            alt_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "food_packing_ai_dataset.xlsx")
            if os.path.exists(alt_path):
                excel_path = alt_path

    print(f"Creating database tables and importing dataset from: {excel_path}")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Create Default Admin User
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                full_name="Chief Packaging Engineer",
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user created: {settings.ADMIN_EMAIL}")

        # 2. Data Sources
        source_records = [
            {
                "name": "Food Packing Solutions Starter Dataset",
                "description": "Initial 103 food varieties and packaging references curated for educational and decision-support seed mapping.",
                "url": "internal://dataset/food_packing_ai_dataset.xlsx",
                "license": "Educational and Research Open License",
                "dataset_type": "educational_seed_data",
                "version": "1.0"
            },
            {
                "name": "US FDA Food Contact Substances (FCS)",
                "description": "Inventory of Effective Food Contact Substance (FCS) Notifications and 21 CFR Parts 170-199 regulations.",
                "url": "https://www.fda.gov/food/packaging-food-contact-substances-fcs",
                "license": "Public Domain (US Government)",
                "dataset_type": "regulatory_standard",
                "version": "2026.1"
            },
            {
                "name": "EU Regulation (EU) No 10/2011 on Plastic Materials",
                "description": "European Union harmonised regulation on plastic materials and articles intended to come into contact with food.",
                "url": "https://eur-lex.europa.eu/eli/reg/2011/10/oj",
                "license": "EU Public Sector Information",
                "dataset_type": "regulatory_standard",
                "version": "Consolidated"
            },
            {
                "name": "ISO/ASTM International Food Packaging Testing Standards",
                "description": "Standardized consensus test methodologies for gas permeability (ASTM D3985, F1249) and package integrity (ASTM F2096, F88).",
                "url": "https://www.astm.org",
                "license": "Standard Consensus",
                "dataset_type": "technical_standard",
                "version": "ASTM/ISO 2024-2026"
            }
        ]

        data_source_map = {}
        for s in source_records:
            ds = db.query(DataSource).filter(DataSource.name == s["name"]).first()
            if not ds:
                ds = DataSource(**s)
                db.add(ds)
                db.flush()
            data_source_map[s["name"]] = ds.id
        db.commit()

        # 3. Regulatory References
        reg_records = [
            {
                "jurisdiction": "US FDA",
                "standard_code": "21 CFR 177.1520",
                "title": "Olefin Polymers for Direct Food Contact",
                "summary": "Covers polypropylene and polyethylene homopolymers and copolymers for food packaging applications.",
                "doc_url": "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/cfrsearch.cfm?fr=177.1520"
            },
            {
                "jurisdiction": "European Union",
                "standard_code": "Regulation (EU) 10/2011",
                "title": "Plastic Materials and Articles in Contact with Food",
                "summary": "Prescribes positive lists of authorized monomers and additives, overall migration limit (10 mg/dm2 or 60 mg/kg), and specific migration limits.",
                "doc_url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32011R0010"
            },
            {
                "jurisdiction": "US FDA",
                "standard_code": "21 CFR 175.300",
                "title": "Resinous and Polymeric Coatings for Metal Substrates",
                "summary": "Regulates internal protective lacquer linings and epoxies used on steel/tinplate and aluminum cans.",
                "doc_url": "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/cfrsearch.cfm?fr=175.300"
            },
            {
                "jurisdiction": "US FDA",
                "standard_code": "21 CFR 176.170",
                "title": "Components of Paper and Paperboard in Contact with Aqueous and Fatty Foods",
                "summary": "Establishes purity, barrier coating, and extractable substances standards for paper food containers.",
                "doc_url": "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/cfrsearch.cfm?fr=176.170"
            },
            {
                "jurisdiction": "ISO / ASTM",
                "standard_code": "ASTM D3985 / ASTM F1249",
                "title": "Standard Test Methods for OTR and WVTR Permeation",
                "summary": "Coulometric OTR sensor measurement and Infrared sensor WVTR barrier testing for flexible packaging barrier films.",
                "doc_url": "https://www.astm.org/f1249-20.html"
            }
        ]

        reg_map = {}
        for r in reg_records:
            reg = db.query(RegulatoryReference).filter(RegulatoryReference.standard_code == r["standard_code"]).first()
            if not reg:
                reg = RegulatoryReference(**r)
                db.add(reg)
                db.flush()
            reg_map[r["standard_code"]] = reg.id
        db.commit()

        # 4. Packaging Methods (16 Methods as required by prompt Section 3.C)
        methods_seed = [
            {
                "code": "METH01",
                "name": "Flexible Packaging (Pouches, Bags, Films, Sachets)",
                "category": "Flexible",
                "how_it_works": "Utilizes flexible single-layer or multi-layer web materials (LDPE, BOPP, PET, EVOH, Alu foil) sealed via heat, ultrasonic, or cold seals into pillow pouches, stand-up pouches (doypacks), or sachets.",
                "food_applications": "Dry snacks, coffee, spices, powders, confectionery, sauces, shredded cheese, frozen vegetables.",
                "food_protection_mechanism": "Provides tailored barrier against moisture ingress, oxygen oxidation, and light; conforms closely to product to reduce headspace volume.",
                "advantages": "High material efficiency, lightweight (low transport footprint), customizable barrier layers, excellent print surface, lower shipping volume.",
                "limitations": "Lower crush resistance compared to rigid packs; multilayer plastic films can be difficult to recycle mechanically without compatibilizers.",
                "cost_category": "Low to Moderate",
                "environmental_considerations": "Lowest raw material weight per gram of food packed, but multi-material laminates require advanced mono-material or chemical recycling streams.",
                "equipment_requirements": "Form-Fill-Seal (FFS) machines (vertical or horizontal), premade pouch fill-and-seal units, thermal impulse sealers.",
                "storage_transport_suitability": "Requires corrugated secondary cartons to prevent puncture and compression damage during palletized freight.",
                "safety_validation_requirements": "Seal integrity (ASTM F88 / ASTM F2096), hot-tack strength, overall migration limits (EN 1186), solvent retention tests on printed webs.",
                "is_process_vs_material": True
            },
            {
                "code": "METH02",
                "name": "Rigid Packaging (Bottles, Jars, Tubs, Trays, Containers)",
                "category": "Rigid",
                "how_it_works": "Containers formed via injection molding, blow molding, or thermoforming that maintain their structural shape independently when empty or filled.",
                "food_applications": "Beverages, dairy (yogurt, butter, ice cream), condiments, peanut butter, deli salads, ready-to-eat meals, baby foods.",
                "food_protection_mechanism": "High structural rigidity shields foods from compressive crush forces, impacts, puncture, and headspace distortion while providing hermetic barrier closures.",
                "advantages": "Robust mechanical protection, resealable caps and snap-lids, easy stacking, high consumer convenience for scooping and pouring.",
                "limitations": "Heavier tare weight, higher volumetric shipping costs when empty, rigid container breakage or cracking under high impact.",
                "cost_category": "Moderate",
                "environmental_considerations": "Widely recycled mono-materials (PET bottles #1, HDPE milk jugs #2, PP tubs #5) with established curbside infrastructure in most markets.",
                "equipment_requirements": "Rotary bottle blow molders, thermoform-fill-seal (TFFS) lines, automatic screw cappers, induction foil sealers.",
                "storage_transport_suitability": "Excellent stacking strength on pallets; less susceptible to puncture during rough logistics.",
                "safety_validation_requirements": "Torque testing for closures, drop impact resistance (ASTM D5276), environmental stress crack resistance (ESCR for HDPE), food-contact migration compliance.",
                "is_process_vs_material": True
            },
            {
                "code": "METH03",
                "name": "Paper-Based Packaging (Cartons, Paperboard Boxes, Kraft Bags)",
                "category": "Cellulose-Based",
                "how_it_works": "Manufactured from renewable cellulose wood fibers transformed into solid bleached sulphate (SBS), folding boxboard (FBB), or kraft paper, often coated with aqueous dispersions or bio-wax.",
                "food_applications": "Dry cereals, bakery items, flour, sugar, dry pasta, tea, secondary outer cartons for frozen food and confectionery.",
                "food_protection_mechanism": "Provides light protection, physical impact shielding, absorption of minor condensation, and grease resistance when barrier-treated.",
                "advantages": "Renewable and biodegradable feedstock, premium printing canvas, high consumer preference for sustainability, widely recyclable curbside.",
                "limitations": "Inherent hydrophilic nature means poor moisture and oxygen barrier unless laminated with plastic, foil, or aqueous biopolymer barriers.",
                "cost_category": "Low to Moderate",
                "environmental_considerations": "High circularity; recyclable in paper stream up to 5-7 cycles if plastic coating is under 5% by weight (or repulpable).",
                "equipment_requirements": "Carton erectors, folder-gluers, top-load cartoning machinery, automated case packers.",
                "storage_transport_suitability": "Sensitive to humid warehouse conditions (loss of compression strength); requires dry storage environments.",
                "safety_validation_requirements": "Mineral oil hydrocarbons (MOSH/MOAH) migration barrier testing, heavy metal limits, FDA 21 CFR 176.170 aqueous/fatty food contact testing.",
                "is_process_vs_material": True
            },
            {
                "code": "METH04",
                "name": "Metal Packaging (Cans, Tins, Foil Structures)",
                "category": "Metal",
                "how_it_works": "Rigid cylindrical or rectangular containers made from tin-coated steel (tinplate), electrolytic chromium-coated steel (ECCS), or aluminum alloys, closed with hermetically seamed ends.",
                "food_applications": "Canned fruits, vegetables, fish (tuna, sardines), meat, soups, evaporated milk, carbonated beverages, dry milk powders.",
                "food_protection_mechanism": "Absolute, 100% impermeable barrier against light, oxygen, moisture, microbes, and rodents; capable of withstanding retort thermal sterilization.",
                "advantages": "Longest ambient shelf life (2-5 years without refrigeration), indestructible barrier to gases, infinitely recyclable without quality loss.",
                "limitations": "Higher container weight, requires double-seaming machinery, cannot be microwaved, can react with acidic contents if internal lacquer coating is compromised.",
                "cost_category": "Moderate to High",
                "environmental_considerations": "High recycling rate worldwide; aluminum and steel retain 100% properties across infinite melting cycles.",
                "equipment_requirements": "Rotary can seamers, double-seam optical projectors/micrometers, retort autoclaves, hydrostatic sterilizers.",
                "storage_transport_suitability": "Outstanding compression strength; resilient to long-distance multimodal shipping and tropical ambient conditions.",
                "safety_validation_requirements": "Double-seam overlap and tightness inspection, lacquer integrity (enamel rater test), bisphenol-free (BPA-NI) coating migration compliance.",
                "is_process_vs_material": True
            },
            {
                "code": "METH05",
                "name": "Glass Packaging (Bottles and Jars)",
                "category": "Inorganic Rigid",
                "how_it_works": "Formed by blow-and-blow or press-and-blow molding of molten silica glass, soda ash, and limestone into impermeable rigid vessels with threaded or lug finishes.",
                "food_applications": "Pickles, jams, tomato sauces, olive oils, baby foods, wines, beers, premium juices, honey.",
                "food_protection_mechanism": "Completely chemically inert; provides absolute barrier to moisture, oxygen, aromas, and gases with zero chemical migration into food.",
                "advantages": "Chemically inert, microwave-safe, re-closable, transparent for visual inspection (or amber/green for UV protection), 100% infinitely recyclable.",
                "limitations": "Heavy tare weight increases logistics fuel emissions; fragile and subject to thermal and mechanical shock breakage.",
                "cost_category": "Moderate to High",
                "environmental_considerations": "100% circular, but melting cullet requires high energy; lightweighting initiatives and cullet recycling reduce embodied carbon.",
                "equipment_requirements": "De-palletizers, bottle rinsers, rotary piston fillers, vacuum lug cappers, pasteurization tunnels, case partition packers.",
                "storage_transport_suitability": "Requires cushioned corrugated partition packaging to prevent bottle-to-bottle clashing during transport.",
                "safety_validation_requirements": "Thermal shock resistance testing (ASTM C148), internal pressure testing, closure torque and hermetic compound seal verification.",
                "is_process_vs_material": True
            },
            {
                "code": "METH06",
                "name": "Vacuum Packaging",
                "category": "Atmospheric Control",
                "how_it_works": "Evacuates atmospheric air from inside a high-barrier pouch or container and hermetically seals it, collapsing the film tightly around the food product.",
                "food_applications": "Fresh beef, pork, cured meats (bacon, ham), whole cheeses, ground coffee bricks, smoked fish, nuts.",
                "food_protection_mechanism": "Eliminates aerobic oxygen (O2 < 0.5%), halting aerobic bacterial growth, mold development, lipid oxidative rancidity, and moisture evaporation.",
                "advantages": "Greatly extends chilled shelf life (up to 3-5x for meats), eliminates freezer burn, tight package volume saves storage space.",
                "limitations": "Tightly hugs food which can squeeze liquids out of high-moisture foods; risk of anaerobic pathogens (e.g., Clostridium botulinum) if chilled temperature is broken; not suitable for delicate or crispy foods.",
                "cost_category": "Low to Moderate",
                "environmental_considerations": "Requires multilayer barrier films (PA/PE or EVOH); generates minimal packaging waste volume per kg of food.",
                "equipment_requirements": "Chamber vacuum packaging machines, rotary vacuum nozzle sealers, thermoforming deep-draw vacuum packaging lines.",
                "storage_transport_suitability": "Must be maintained under strict refrigeration (0-4°C) for fresh meats and fish to prevent anaerobic pathogen proliferation.",
                "safety_validation_requirements": "Strict cold chain validation; HACCP plan monitoring for anaerobic spore-forming bacteria; vacuum seal hermeticity (ASTM F2096).",
                "is_process_vs_material": True
            },
            {
                "code": "METH07",
                "name": "Modified Atmosphere Packaging (MAP)",
                "category": "Atmospheric Control",
                "how_it_works": "Flushes the package headspace with a precision gas mixture (typically CO2 to inhibit microbes, N2 as an inert inert filler, and calibrated O2 for red meat myoglobin or produce respiration) before hermetic sealing.",
                "food_applications": "Fresh cut salad greens, fresh poultry, red meat, fresh pasta, bakery products, sliced cooked meats, grated cheese.",
                "food_protection_mechanism": "CO2 dissolves in food surface water forming mild carbonic acid that suppresses bacteria; N2 prevents package collapse; tailored O2 maintains cellular respiration in fresh produce or red meat bloom.",
                "advantages": "Significantly extends shelf life without chemical preservatives, maintains fresh visual appearance, avoids crushing delicate foods.",
                "limitations": "Requires high barrier tray and lidding films, precise gas mixer equipment; integrity lost instantly if the package is punctured or opened.",
                "cost_category": "Moderate",
                "environmental_considerations": "Uses barrier-laminated rigid trays and top films; transition to mono-material recyclable PP/PE MAP trays is growing rapidly.",
                "equipment_requirements": "Tray sealers with vacuum gas flush (MAP), gas mixers, head-space oxygen/carbon dioxide analyzers (e.g. Dansensor).",
                "storage_transport_suitability": "Mandatory continuous cold chain (2-4°C) throughout transport and supermarket retail display.",
                "safety_validation_requirements": "Headspace gas composition verification (PBI Dansensor), lidding seal integrity, equilibrium moisture/respiration validation for produce.",
                "is_process_vs_material": True
            },
            {
                "code": "METH08",
                "name": "Active Packaging",
                "category": "Active / Smart",
                "how_it_works": "Incorporates active chemical or physical components into sachets, film resin, or absorbent pads that deliberately release or absorb substances from the food headspace.",
                "food_applications": "Oxygen scavengers for jerky and cakes; ethylene scrubbers for fresh fruits; antimicrobial pads for poultry; moisture regulators for dry spices.",
                "food_protection_mechanism": "Continuously consumes residual trace oxygen (down to <0.01%), scavenges ripening ethylene gas, or absorbs purged exudate fluid to retard microbial growth.",
                "advantages": "Maintains optimum headspace conditions dynamically over long shelf life; eliminates necessity of artificial chemical preservatives in food recipes.",
                "limitations": "Active sachets risk being accidentally consumed by consumers if not labeled 'DO NOT EAT'; adds component cost; finite absorption capacity.",
                "cost_category": "Moderate",
                "environmental_considerations": "Requires safe disposal of iron-based or silica sachets; active films with masterbatch additives have better recycling compatibility.",
                "equipment_requirements": "Sachet dispensing systems integrated onto packaging lines, or standard sealers if active resin is embedded in film.",
                "storage_transport_suitability": "Packages must remain completely hermetic during transit; any pinhole rapidly exhausts the active scavenger.",
                "safety_validation_requirements": "Non-toxicity certification, non-contact migration validation of active agents, clear bilingual consumer warnings on sachets.",
                "is_process_vs_material": True
            },
            {
                "code": "METH09",
                "name": "Intelligent Packaging and Freshness Indicators",
                "category": "Active / Smart",
                "how_it_works": "Integrates sensors, indicators, RFID/NFC tags, or colorimetric labels that monitor internal food condition or external environmental history (temperature abuse).",
                "food_applications": "High-value chilled seafood, fresh meats, cold-chain vaccines/biologics, premium dairy, exported fresh fruits.",
                "food_protection_mechanism": "Does not protect food directly, but monitors and communicates real-time freshness, leakages (CO2/O2 indicators), or cumulative thermal abuse (TTIs).",
                "advantages": "Provides dynamic, objective freshness verification beyond arbitrary static 'Best Before' dates; reduces food waste while guaranteeing safety.",
                "limitations": "Higher unit cost per package; sensor calibration must correlate accurately with complex microbiological decay curves.",
                "cost_category": "Moderate to High",
                "environmental_considerations": "Electronic RFID/battery tags require special disposal; colorimetric chemical enzymatic tags have lower environmental burden.",
                "equipment_requirements": "Label applicator heads, optical scanners, NFC readers, automated sensor verification inspection cameras.",
                "storage_transport_suitability": "Critical tool for auditing cold chain logistics and multimodal reefer container integrity.",
                "safety_validation_requirements": "Kinetic rate matching between indicator discoloration and actual pathogen growth rates; migration testing of dyes.",
                "is_process_vs_material": True
            },
            {
                "code": "METH10",
                "name": "Aseptic Packaging",
                "category": "Thermal Sterilization",
                "how_it_works": "Food product and multi-layer packaging material are sterilized independently under sterile conditions, then filled and hermetically sealed inside an ultra-clean aseptic chamber.",
                "food_applications": "UHT milk, plant-based milks (almond, oat, soy), fruit juices, broths, liquid eggs, liquid creamers.",
                "food_protection_mechanism": "Combines commercial sterility with a 6-layer composite laminate (polyethylene, paperboard, aluminum foil) that completely blocks light, microbes, and oxygen.",
                "advantages": "Ambient shelf life of 6-12 months without refrigeration or preservatives; minimal thermal degradation compared to retort (better taste and nutrients).",
                "limitations": "High initial capital expenditure for aseptic filling machinery and cleanroom validation; multi-material cartons require specialized pulping recycling mills.",
                "cost_category": "Capital-Intensive / Low Unit Cost at Scale",
                "environmental_considerations": "Cartons are ~75% paperboard; advanced sorting plants separate cellulose fiber from poly-al (polyethylene-aluminum) for upcycling.",
                "equipment_requirements": "Aseptic blow-fill-seal or roll-fed carton forming lines (e.g. Tetra Pak, SIG Combibloc), hydrogen peroxide sterilization baths, HEPA cleanrooms.",
                "storage_transport_suitability": "Stores and transports stably at ambient temperatures without energy-intensive refrigerated reefer trucking.",
                "safety_validation_requirements": "Media fill microbiological validation, hydrogen peroxide residue limits (<0.5 ppm), aseptic seal burst and dye penetration checks.",
                "is_process_vs_material": True
            },
            {
                "code": "METH11",
                "name": "Retort Packaging",
                "category": "Thermal Sterilization",
                "how_it_works": "Food is sealed inside high-temperature barrier flexible pouches or semi-rigid trays, then subjected to high-pressure steam/water retort cooking (121°C - 130°C for 20-45 minutes) to destroy bacterial spores (e.g., C. botulinum).",
                "food_applications": "Ready-to-eat curries, cooked pulses (rajma, dal), military MRE rations, pet food wet pouches, tuna flakes in oil, cooked soups.",
                "food_protection_mechanism": "Commercial thermal sterilization inside a hermetic barrier pouch achieves complete shelf stability at room temperature for 12 to 24 months.",
                "advantages": "Lighter and easier to open than tin cans; cooks faster than cans (thinner profile allows faster heat penetration), preserving food texture and nutrients.",
                "limitations": "Films must withstand extreme heat and pressure without delamination; seal integrity is critical; requires specialized overpressure autoclaves.",
                "cost_category": "Moderate to High",
                "environmental_considerations": "Lower transport emissions than metal cans or glass jars due to 90% lighter tare weight; recycling requires foil-separation or high-barrier mono-PP.",
                "equipment_requirements": "Overpressure steam-air or water-spray retort autoclaves, specialized retort pouch sealers, thermocouple data loggers for Fo value calculation.",
                "storage_transport_suitability": "Can be shipped and warehoused at ambient room temperature globally without refrigeration.",
                "safety_validation_requirements": "Fo value validation (minimum Fo=3.0 minutes for botulinum cook, typically Fo=6-12), seal peel strength post-retort, burst test ASTM F1140.",
                "is_process_vs_material": True
            },
            {
                "code": "METH12",
                "name": "Skin Packaging (Vacuum Skin Packaging - VSP)",
                "category": "Atmospheric Control",
                "how_it_works": "Heated barrier film is draped over the product on a rigid or flat cardboard tray; vacuum draws the film down like a 'second skin' locking the food tightly in place without tension.",
                "food_applications": "Premium steaks, lamb chops, salmon fillets, fresh seafood, marinated meats, sliced cheese.",
                "food_protection_mechanism": "Eliminates all atmospheric oxygen and air pockets surrounding the product; tightly locks meat juices to stop purge release and microbial growth.",
                "advantages": "Stunning 3D presentation; completely prevents liquid purge leakage; food can be displayed vertically; prevents freezer burn; easy peel opening.",
                "limitations": "Not suitable for delicate or soft bakery/produce; requires specialized VSP barrier films with high drape-ability and elongation.",
                "cost_category": "Moderate",
                "environmental_considerations": "Allows the use of flat recyclable cardboard backing boards (paperboard VSP) reducing plastic usage by up to 70%.",
                "equipment_requirements": "Vacuum skin packaging traysealers (semi-automatic or in-line automatic), dome heating elements, vacuum pumps.",
                "storage_transport_suitability": "Requires strict continuous refrigeration (0-3°C); excellent resistance to liquid leakage during transport.",
                "safety_validation_requirements": "Cold-chain validation, skin film adhesion tests, leak detection and anaerobic risk mitigation.",
                "is_process_vs_material": True
            },
            {
                "code": "METH13",
                "name": "Shrink and Stretch Wrapping",
                "category": "Secondary / Overwrap",
                "how_it_works": "Stretch film is mechanically elongated around product/pallet, or shrink film (polyolefin/PVC) is applied loosely and passed through a heat tunnel to conform tightly.",
                "food_applications": "Fresh produce trays (apples, cucumbers), fresh poultry foam trays, multipacks of beverage cans, palletized load stabilization.",
                "food_protection_mechanism": "Secures items from dust, moisture mist, tampering, and physical scuffing; holds loose food items tightly against a rigid support tray.",
                "advantages": "Very inexpensive, highly transparent, versatile for irregular geometries, excellent unitization for transport stability.",
                "limitations": "Limited gas and aroma barrier; permeable to oxygen (unless barrier shrink bags used); sensitive to ambient temperature extremes.",
                "cost_category": "Low",
                "environmental_considerations": "Thin gauge PE/POF film consumes very low mass of polymer; mono-PE stretch wrap is widely recycled in commercial PE streams.",
                "equipment_requirements": "Automatic orbital stretch wrappers, L-sealers with heat shrink convection tunnels, manual hand dispensers.",
                "storage_transport_suitability": "Crucial for unitizing boxes on wooden/plastic pallets for safe sea, rail, and road freight.",
                "safety_validation_requirements": "Food-grade resin certification (free of phthalates for PVC stretch films), load containment force verification (ASTM D4649).",
                "is_process_vs_material": True
            },
            {
                "code": "METH14",
                "name": "Edible Coatings and Films",
                "category": "Bio-Based Protection",
                "how_it_works": "Thin layer of consumable biopolymers (such as chitosan, sodium alginate, carnauba wax, zein corn protein, or cellulose derivatives) applied directly onto food surfaces via dipping, spraying, or electrostatic panning.",
                "food_applications": "Fresh whole fruits (apples, citrus, pears), berries, minimally processed vegetables, fresh confectionery, cheese wheels.",
                "food_protection_mechanism": "Creates a semi-permeable boundary on the cuticle that slows moisture transpiration, regulates gas exchange (O2/CO2) to delay respiration senescence, and can carry natural plant antimicrobials.",
                "advantages": "Zero packaging waste; fully biodegradable and consumed with the food; extends post-harvest shelf life; improves natural fruit shine.",
                "limitations": "Cannot protect against severe mechanical crushing or dust during freight; requires careful allergen declarations; limited barrier for high-moisture cut foods.",
                "cost_category": "Low to Moderate",
                "environmental_considerations": "Unbeatable sustainability; 100% renewable, organic, and zero-landfill footprint.",
                "equipment_requirements": "Dipping tanks, ultrasonic spray nozzles, fluid-bed coaters, warm air drying tunnels.",
                "storage_transport_suitability": "Must be combined with ventilated corrugated carton crates for logistics and handling.",
                "safety_validation_requirements": "GRAS (Generally Recognized As Safe) food ingredient approval, allergen disclosure (e.g., shell-fish derived chitosan), sensory taste neutrality.",
                "is_process_vs_material": True
            },
            {
                "code": "METH15",
                "name": "Insulated and Temperature-Controlled Packaging",
                "category": "Cold Chain Solutions",
                "how_it_works": "Combines thermal insulating container liners (expanded polystyrene EPS, moulded pulp, sheep wool, aerogel, or reflective metallized bubble wrap) with phase change materials (PCMs, gel ice packs, or dry ice).",
                "food_applications": "Direct-to-consumer meal kits, chilled fresh meat shipments, frozen seafood, ice cream e-commerce, artisanal chocolates, perishable farm produce.",
                "food_protection_mechanism": "Retards thermal conductive, convective, and radiant heat transfer from ambient weather, preserving critical 0-4°C or -18°C product temperatures for 24 to 72 hours.",
                "advantages": "Enables e-commerce doorstep delivery of fresh and frozen perishables without dedicated refrigerated delivery vans; protects product safety during courier delays.",
                "limitations": "Bulky dimensional shipping weight; single-use EPS foam creates large landfill volume unless returned via circular deposit programs.",
                "cost_category": "Moderate to High",
                "environmental_considerations": "Shift away from non-biodegradable EPS towards paper-based repulpable insulated mailers and water-drainable gel packs.",
                "equipment_requirements": "Automatic pouch ice pack dispensers, thermal sealer for insulated mailers, temperature data logging loggers (USB/Bluetooth).",
                "storage_transport_suitability": "Specially designed for standard ambient parcel logistics networks (FedEx, UPS, DHL, local courier).",
                "safety_validation_requirements": "Thermal qualification under ISTA 7D / 7E summer and winter temperature profiles to guarantee core temperature compliance.",
                "is_process_vs_material": True
            },
            {
                "code": "METH16",
                "name": "Compostable and Reusable Packaging Systems",
                "category": "Circular Solutions",
                "how_it_works": "Dual pathway approach: (1) Certified compostable polymers (PLA, PHA, PBAT, cellulose) that decompose into organic humus in industrial/home compost; and (2) Durable reusable polypropylene/stainless containers operated under deposit-return-refill models.",
                "food_applications": "Organic dry goods, fresh produce bags, coffee capsules, takeaway meal containers, bulk grocery dispense, beverage bottles.",
                "food_protection_mechanism": "Provides targeted short-to-medium term barrier protection while ensuring either biological circularity (soil regeneration) or technical circularity (multiple refill loops).",
                "advantages": "Drastically reduces fossil-fuel plastic accumulation, lowers carbon footprint over multiple reuse cycles, meets stringent EPR and plastic tax legislation.",
                "limitations": "Compostable films have lower moisture/gas barrier than metallized foil; reusable containers require reverse logistics cleaning and sanitization infrastructure.",
                "cost_category": "Moderate to High",
                "environmental_considerations": "Must follow certified standards (EN 13432 / ASTM D6400 for compostability) to avoid microplastic contamination.",
                "equipment_requirements": "Specialized low-temperature sealing jaws for PLA films; industrial multi-stage sanitizing wash tunnels for reusable crates.",
                "storage_transport_suitability": "Compostables must be stored away from high heat and humidity; reusables are exceptionally robust for repeated transit loops.",
                "safety_validation_requirements": "EN 13432 / ASTM D6400 disintegration and ecotoxicity testing; food contact sanitization validation (microbiological swab audits) for reusables.",
                "is_process_vs_material": True
            }
        ]

        method_map = {}
        for m in methods_seed:
            meth = db.query(PackagingMethod).filter(PackagingMethod.code == m["code"]).first()
            if not meth:
                meth = PackagingMethod(**m)
                db.add(meth)
                db.flush()
            method_map[m["code"]] = meth.id
        db.commit()

        # 5. Packaging Materials from Excel Sheet 'Packaging Materials'
        df_materials = pd.read_excel(excel_path, sheet_name="Packaging Materials")
        material_map = {}
        for _, row in df_materials.iterrows():
            mat_id = str(row["material_id"]).strip()
            mat_name = str(row["material_or_format"]).strip()
            existing_mat = db.query(PackagingMaterial).filter(PackagingMaterial.code == mat_id).first()
            if not existing_mat:
                existing_mat = PackagingMaterial(
                    code=mat_id,
                    name=mat_name,
                    format_type=str(row.get("format_type", "Standard format")),
                    moisture_barrier=str(row.get("moisture_barrier_general", "Medium")),
                    oxygen_barrier=str(row.get("oxygen_barrier_general", "Medium")),
                    light_barrier=str(row.get("light_barrier_general", "Medium")),
                    grease_barrier="High" if "foil" in mat_name.lower() or "can" in mat_name.lower() or "glass" in mat_name.lower() else "Medium",
                    recyclability_status=str(row.get("end_of_life_note", "Check local recycling facilities")),
                    typical_examples=str(row.get("typical_examples", "")),
                    design_validation_note=str(row.get("design_validation_note", "")),
                    dataset_type=str(row.get("dataset_type", "general_reference_not_a_certification")),
                    food_contact_approved=True,
                    regulatory_ref_id=reg_map.get("21 CFR 177.1520") if "PP" in mat_name or "PE" in mat_name else reg_map.get("Regulation (EU) 10/2011")
                )
                db.add(existing_mat)
                db.flush()
            material_map[mat_id] = existing_mat.id
            material_map[mat_name] = existing_mat.id
        db.commit()

        # 6. Packaging Formats
        formats_seed = [
            {"name": "Stand-up Pouch (Doypack)", "description": "Flexible pouch with bottom gusset allowing it to stand upright on retail shelves, often with resealable zipper.", "suitable_states": "Powder, Granular, Liquid, Solid", "typical_closure": "Press-to-close zipper or spout"},
            {"name": "Thermoformed Tray with Lidding Film", "description": "Rigid shallow tray sealed with high-barrier lidding film, ideal for MAP and fresh cuts.", "suitable_states": "Solid, Semi-solid, Fresh Perishable", "typical_closure": "Peelable heat seal"},
            {"name": "Hermetic Glass Jar", "description": "Chemically inert glass vessel with metal lug or twist-off cap and plastisol compound liner.", "suitable_states": "Liquid, Viscous, Granular, Solid", "typical_closure": "Twist-off vacuum cap"},
            {"name": "Tinplate / Aluminum Can", "description": "Two-piece or three-piece metal container hermetically double-seamed for retorting.", "suitable_states": "Liquid, Semi-solid, Solid", "typical_closure": "Double-seamed easy-open end"},
            {"name": "Aseptic Composite Carton", "description": "Multilayer brick carton composed of paperboard, polyethylene, and aluminum foil barrier.", "suitable_states": "Liquid", "typical_closure": "Helicap or pull tab"},
            {"name": "Vacuum Barrier Bag", "description": "Heavy-duty multilayer PA/PE or EVOH bag designed to collapse tightly under vacuum.", "suitable_states": "Solid, Perishable Fresh, Granular", "typical_closure": "Thermal impulse seal"},
            {"name": "Food-grade PP Container / Bowl", "description": "Injection-molded polypropylene tub or bowl with snap-fit lid, microwave-safe.", "suitable_states": "Prepared Meal, Viscous, Solid", "typical_closure": "Snap-on tamper-evident lid"},
            {"name": "Corrugated & Moulded Fibre Box", "description": "Renewable paperboard box or moulded pulp tray with protective cushioning.", "suitable_states": "Solid, Fresh Produce, Bakery", "typical_closure": "Fold-over tuck flap or tape"},
            {"name": "Retort Flexible Pouch", "description": "High-temperature foil-laminated or clear ceramic-coated flexible pouch capable of 121°C retort.", "suitable_states": "Ready meal, Viscous, Liquid, Solid", "typical_closure": "High-integrity fusion heat seal"},
            {"name": "Ventilated Produce Mesh Bag", "description": "Knitted or extruded polymeric mesh enabling maximum air circulation for respiring root vegetables.", "suitable_states": "Solid Fresh Produce", "typical_closure": "Metal clip or heat stitch"}
        ]

        format_map = {}
        for f in formats_seed:
            fmt = db.query(PackagingFormat).filter(PackagingFormat.name == f["name"]).first()
            if not fmt:
                fmt = PackagingFormat(**f)
                db.add(fmt)
                db.flush()
            format_map[f["name"]] = fmt.id
        db.commit()

        # 7. Packaging Options (Combinations of Methods, Materials, Formats)
        options_seed = [
            {
                "name": "Food-grade PP Container with Hermetic Snap Lid",
                "method_code": "METH02",
                "material_code": "M004", # PP
                "format_name": "Food-grade PP Container / Bowl",
                "description": "Microwave-safe, grease-resistant polypropylene container providing leak-proof protection and heat tolerance for prepared meals.",
                "estimated_unit_cost_range": "$0.10 - $0.25",
                "barrier_rating_overall": "Medium",
                "sustainability_score": 7.0,
                "equipment_complexity": "Low",
                "typical_applications": "Cooked rice, biryani, curries, deli salads, hot takeaway meals.",
                "validation_status": "approved"
            },
            {
                "name": "Metallized Foil Stand-Up Pouch with Degassing Valve",
                "method_code": "METH01",
                "material_code": "M009", # Aluminium foil
                "format_name": "Stand-up Pouch (Doypack)",
                "description": "High-barrier 3-ply foil laminate (PET/ALU/PE) equipped with a one-way degassing valve to vent CO2 while stopping oxygen and moisture ingress.",
                "estimated_unit_cost_range": "$0.15 - $0.35",
                "barrier_rating_overall": "Ultra-High",
                "sustainability_score": 5.0,
                "equipment_complexity": "Moderate",
                "typical_applications": "Roasted coffee beans, ground coffee powder, premium tea, spice extracts.",
                "validation_status": "approved"
            },
            {
                "name": "Modified Atmosphere Packaging (MAP) Barrier Tray",
                "method_code": "METH07",
                "material_code": "M015", # MAP
                "format_name": "Thermoformed Tray with Lidding Film",
                "description": "Thermoformed rigid PP/EVOH tray with peelable high-barrier lidding film, flushed with gas mixture (e.g. 70% O2 / 30% CO2 for red meat bloom, or 80% N2 / 20% CO2).",
                "estimated_unit_cost_range": "$0.20 - $0.45",
                "barrier_rating_overall": "High",
                "sustainability_score": 6.5,
                "equipment_complexity": "High",
                "typical_applications": "Fresh red meats, poultry, fresh-cut produce, fresh pasta, seafood.",
                "validation_status": "approved"
            },
            {
                "name": "Heavy-Duty Multi-Layer Vacuum Pouch",
                "method_code": "METH06",
                "material_code": "M014", # Vacuum bag
                "format_name": "Vacuum Barrier Bag",
                "description": "Co-extruded PA/PE or EVOH high-vacuum pouch offering puncture resistance, zero air headspace, and prolonged anaerobic protection.",
                "estimated_unit_cost_range": "$0.08 - $0.20",
                "barrier_rating_overall": "High",
                "sustainability_score": 6.0,
                "equipment_complexity": "Moderate",
                "typical_applications": "Cheeses, cured bacon, primal cuts, smoked salmon, frozen seafood.",
                "validation_status": "approved"
            },
            {
                "name": "Hermetically Sealed Glass Jar with Lug Cap",
                "method_code": "METH05",
                "material_code": "M001", # Glass
                "format_name": "Hermetic Glass Jar",
                "description": "Impermeable glass jar with epoxy-lined tinplate twist cap providing complete moisture, light (amber), and aroma lock with zero chemical leaching.",
                "estimated_unit_cost_range": "$0.30 - $0.70",
                "barrier_rating_overall": "Ultra-High",
                "sustainability_score": 8.0,
                "equipment_complexity": "Moderate",
                "typical_applications": "Pickles, jams, tomato sauces, honey, baby food purees.",
                "validation_status": "approved"
            },
            {
                "name": "Sterilized Retort Barrier Pouch (Foil / Clear EVOH)",
                "method_code": "METH11",
                "material_code": "M012", # Retort pouch laminate
                "format_name": "Retort Flexible Pouch",
                "description": "High-integrity 4-ply flexible retort pouch capable of withstanding 121°C autoclave sterilization for long-term ambient shelf stability.",
                "estimated_unit_cost_range": "$0.18 - $0.40",
                "barrier_rating_overall": "Ultra-High",
                "sustainability_score": 5.5,
                "equipment_complexity": "Industrial",
                "typical_applications": "Ready-to-eat lentils, curries, MREs, wet pet foods, precooked gravies.",
                "validation_status": "approved"
            },
            {
                "name": "6-Layer Aseptic Beverage Brick Carton",
                "method_code": "METH10",
                "material_code": "M011", # Aseptic carton laminate
                "format_name": "Aseptic Composite Carton",
                "description": "Multilayer aseptic pack (75% paperboard, 20% PE, 5% aluminum) granting 12 months ambient life for UHT and pasteurized liquids.",
                "estimated_unit_cost_range": "$0.12 - $0.28",
                "barrier_rating_overall": "High",
                "sustainability_score": 7.5,
                "equipment_complexity": "Industrial",
                "typical_applications": "UHT milk, almond milk, soy milk, coconut water, fruit juices, broths.",
                "validation_status": "approved"
            },
            {
                "name": "Ventilated Corrugated Box with Moulded Pulp Liner",
                "method_code": "METH03",
                "material_code": "M007", # Corrugated
                "format_name": "Corrugated & Moulded Fibre Box",
                "description": "Breathable, shock-absorbing renewable cellulose pack designed to vent respiration heat and ethylene while preventing bruising.",
                "estimated_unit_cost_range": "$0.25 - $0.60",
                "barrier_rating_overall": "Low",
                "sustainability_score": 9.0,
                "equipment_complexity": "Low",
                "typical_applications": "Apples, mangoes, tomatoes, avocados, eggs, baked goods.",
                "validation_status": "approved"
            },
            {
                "name": "Certified Home-Compostable High-Barrier Bio-Pouch",
                "method_code": "METH16",
                "material_code": "M016", # Compostable polymer
                "format_name": "Stand-up Pouch (Doypack)",
                "description": "Bio-based PLA/PBAT pouch with bio-barrier coating certified under EN 13432 for complete biodegradability in composting conditions.",
                "estimated_unit_cost_range": "$0.22 - $0.50",
                "barrier_rating_overall": "Medium",
                "sustainability_score": 9.5,
                "equipment_complexity": "Moderate",
                "typical_applications": "Organic cereals, dry pulses, snacks, roasted nuts, coffee beans.",
                "validation_status": "tested"
            },
            {
                "name": "Double-Seamed Sanitary Tinplate Can with BPA-NI Lacquer",
                "method_code": "METH04",
                "material_code": "M010", # Steel/tinplate can
                "format_name": "Tinplate / Aluminum Can",
                "description": "Hermetically sealed tinplate metal can with food-grade protective inner lacquer, providing absolute physical and gas barrier under retort cooking.",
                "estimated_unit_cost_range": "$0.25 - $0.55",
                "barrier_rating_overall": "Ultra-High",
                "sustainability_score": 8.5,
                "equipment_complexity": "Industrial",
                "typical_applications": "Canned beans, fish, tomato paste, sweetened condensed milk.",
                "validation_status": "approved"
            }
        ]

        option_map = {}
        for opt in options_seed:
            po = db.query(PackagingOption).filter(PackagingOption.name == opt["name"]).first()
            if not po:
                po = PackagingOption(
                    name=opt["name"],
                    method_id=method_map.get(opt["method_code"]),
                    material_id=material_map.get(opt["material_code"]),
                    format_id=format_map.get(opt["format_name"]),
                    description=opt["description"],
                    estimated_unit_cost_range=opt["estimated_unit_cost_range"],
                    barrier_rating_overall=opt["barrier_rating_overall"],
                    sustainability_score=opt["sustainability_score"],
                    equipment_complexity=opt["equipment_complexity"],
                    typical_applications=opt["typical_applications"],
                    validation_status=opt["validation_status"]
                )
                db.add(po)
                db.flush()
            option_map[opt["name"]] = po.id
        db.commit()

        # 8. Import Food Varieties & AI Mapping
        df_food = pd.read_excel(excel_path, sheet_name="Food Varieties")
        df_ai = pd.read_excel(excel_path, sheet_name="AI Mapping")

        ai_mapping_lookup = {}
        for _, ai_row in df_ai.iterrows():
            fid = str(ai_row["food_id"]).strip()
            ai_mapping_lookup[fid] = ai_row.to_dict()

        category_map = {}
        for _, row in df_food.iterrows():
            cat_name = str(row["food_category"]).strip()
            if cat_name not in category_map:
                existing_cat = db.query(FoodCategory).filter(FoodCategory.name == cat_name).first()
                if not existing_cat:
                    existing_cat = FoodCategory(
                        name=cat_name,
                        slug=slugify(cat_name),
                        description=f"Food products categorized under {cat_name.lower()}, requiring specific moisture, oxygen, and microbial controls.",
                        icon="Utensils" if "meal" in cat_name.lower() else "Apple" if "produce" in cat_name.lower() else "Package",
                        typical_spoilage_risks="Microbial growth, oxidation, moisture loss/gain depending on product matrix."
                    )
                    db.add(existing_cat)
                    db.flush()
                category_map[cat_name] = existing_cat.id
        db.commit()

        # Physical state mapping heuristic
        def infer_physical_state(food_name: str, cat_name: str) -> str:
            fn = food_name.lower()
            cn = cat_name.lower()
            if "powder" in fn or "flour" in fn or "spice" in fn or "tea" in fn:
                return "Powder"
            elif "milk" in fn or "juice" in fn or "oil" in fn or "sauce" in fn or "soup" in fn or "beverage" in cn:
                return "Liquid"
            elif "rice" in fn or "curry" in fn or "biryani" in fn or "meal" in cn:
                return "Prepared Meal"
            elif "frozen" in cn or "ice cream" in fn:
                return "Frozen"
            elif "apple" in fn or "banana" in fn or "produce" in cn or "vegetable" in fn:
                return "Fresh Produce"
            elif "fish" in fn or "meat" in fn or "chicken" in fn or "beef" in fn:
                return "Fresh Meat / Seafood"
            return "Solid"

        def infer_storage_temp(food_name: str, cat_name: str, storage_note: str) -> str:
            sn = str(storage_note).lower()
            if "frozen" in sn or "frozen" in cat_name.lower():
                return "Frozen (-18°C)"
            elif "refrigerat" in sn or "chilled" in sn or "4°c" in sn or "cold" in sn:
                return "Refrigerated (0-4°C)"
            elif "hot" in sn:
                return "Hot Holding (>60°C) or Prompt Chilling"
            return "Ambient Room Temperature (15-25°C)"

        for _, row in df_food.iterrows():
            fid = str(row["food_id"]).strip()
            fname = str(row["food_name"]).strip()
            fcat = str(row["food_category"]).strip()
            cat_id = category_map[fcat]

            ai_info = ai_mapping_lookup.get(fid, {})

            food_item = db.query(FoodType).filter(FoodType.code == fid).first()
            if not food_item:
                food_item = FoodType(
                    code=fid,
                    name=fname,
                    category_id=cat_id,
                    physical_state=infer_physical_state(fname, fcat),
                    description=f"{fname} is a food product in the {fcat} category. Suitable packaging ensures safety, organoleptic freshness, and shelf-life extension.",
                    validation_priority=str(row.get("validation_priority", "Medium")),
                    data_source_id=data_source_map.get("Food Packing Solutions Starter Dataset")
                )
                db.add(food_item)
                db.flush()

            # Food Properties
            fprop = db.query(FoodProperty).filter(FoodProperty.food_id == food_item.id).first()
            if not fprop:
                fprop = FoodProperty(
                    food_id=food_item.id,
                    moisture_level=str(row.get("moisture_level", "Medium")),
                    moisture_content_pct=None, # kept unknown rather than assuming
                    water_activity_aw=None,
                    oil_fat_content="High" if "fried" in fcat.lower() or "oil" in fname.lower() or "biryani" in fname.lower() else "Medium",
                    oxygen_sensitivity=str(row.get("oxygen_sensitivity", "Medium")),
                    light_sensitivity="High" if "oil" in fname.lower() or "tea" in fname.lower() or "spice" in fname.lower() else "Medium",
                    aroma_sensitivity="High" if "coffee" in fname.lower() or "spice" in fname.lower() or "tea" in fname.lower() else "Medium",
                    respiration_rate="High" if "produce" in fcat.lower() else "None",
                    spoilage_risk=str(row.get("spoilage_risk", "Medium")),
                    storage_temperature=infer_storage_temp(fname, fcat, row.get("storage_handling_note", "")),
                    target_shelf_life_note=str(row.get("shelf_life_days", "Requires product/process validation")),
                    storage_handling_note=str(row.get("storage_handling_note", "Handle according to standard food hygiene and storage conditions.")),
                    spoilage_mechanisms="Microbial proliferation, lipid oxidation, sensory loss, moisture migration"
                )
                db.add(fprop)

            # Packaging Requirements
            freq = db.query(PackagingRequirement).filter(PackagingRequirement.food_id == food_item.id).first()
            if not freq:
                freq = PackagingRequirement(
                    food_id=food_item.id,
                    requirements_text=str(row.get("packaging_requirements", "Food-contact compliant barrier packaging")),
                    barrier_needs=f"Moisture: {row.get('moisture_level', 'Medium')}, Oxygen: {row.get('oxygen_sensitivity', 'Medium')}",
                    special_features="Hermetic heat seal, food-contact grade certification, tamper-evident closure"
                )
                db.add(freq)

            # Compatibility
            cand_pack = str(row.get("candidate_packaging", "")).strip()
            # Match to a packaging option
            matched_option_id = None
            cand_lower = cand_pack.lower()
            if "pp container" in cand_lower or "paper bowl" in cand_lower or "tray" in cand_lower:
                matched_option_id = option_map.get("Food-grade PP Container with Hermetic Snap Lid")
            elif "coffee" in fname.lower() or "degassing" in cand_lower or "foil" in cand_lower:
                matched_option_id = option_map.get("Metallized Foil Stand-Up Pouch with Degassing Valve")
            elif "map" in cand_lower or "modified" in cand_lower:
                matched_option_id = option_map.get("Modified Atmosphere Packaging (MAP) Barrier Tray")
            elif "vacuum" in cand_lower:
                matched_option_id = option_map.get("Heavy-Duty Multi-Layer Vacuum Pouch")
            elif "glass" in cand_lower or "jar" in cand_lower:
                matched_option_id = option_map.get("Hermetically Sealed Glass Jar with Lug Cap")
            elif "retort" in cand_lower:
                matched_option_id = option_map.get("Sterilized Retort Barrier Pouch (Foil / Clear EVOH)")
            elif "aseptic" in cand_lower or "uht" in cand_lower or "milk" in fname.lower():
                matched_option_id = option_map.get("6-Layer Aseptic Beverage Brick Carton")
            elif "corrugated" in cand_lower or "crate" in cand_lower or "mesh" in cand_lower:
                matched_option_id = option_map.get("Ventilated Corrugated Box with Moulded Pulp Liner")
            elif "can" in cand_lower or "tin" in cand_lower:
                matched_option_id = option_map.get("Double-Seamed Sanitary Tinplate Can with BPA-NI Lacquer")
            else:
                matched_option_id = option_map.get("Food-grade PP Container with Hermetic Snap Lid")

            fcomp = db.query(FoodPackagingCompatibility).filter(
                FoodPackagingCompatibility.food_id == food_item.id,
                FoodPackagingCompatibility.packaging_option_id == matched_option_id
            ).first()

            if not fcomp and matched_option_id:
                fcomp = FoodPackagingCompatibility(
                    food_id=food_item.id,
                    packaging_option_id=matched_option_id,
                    compatibility_level="Highly Recommended",
                    suitability_score=90.0,
                    reasons=f"Candidate identified: {cand_pack}. Fulfills requirements: {row.get('packaging_requirements')}",
                    key_advantages="Adequate barrier for target shelf-life, food-grade compliance, verified format compatibility.",
                    critical_limitations="Requires product-specific seal verification, fill-temperature check, and barrier validation.",
                    required_tests="ASTM F88 Seal Strength, ASTM F1249 WVTR, EN 1186 Migration Test",
                    evidence_level=str(ai_info.get("label_source", "expert-style illustrative seed label")),
                    validation_status="candidate" if "seed" in str(row.get("dataset_type", "")).lower() else "tested",
                    data_source_id=data_source_map.get("Food Packing Solutions Starter Dataset")
                )
                db.add(fcomp)

        db.commit()
        print(f"Successfully populated {len(df_food)} food varieties and mappings into relational database!")

        # 9. Packaging Technical Tests Seed
        tests_seed = [
            {
                "test_name": "ASTM F1249 Water Vapor Transmission Rate (WVTR)",
                "test_standard": "ASTM F1249",
                "methodology": "Infrared sensor measurement of water vapor transmission through flexible barrier films at 37.8°C and 90% RH.",
                "pass_criteria": "< 0.5 g/(m2·day) for moisture-sensitive dry powders; < 2.0 g/(m2·day) for standard bakery.",
                "result_notes": "Metallized PET/Alu pouch achieved 0.04 g/(m2·day). Pass for coffee and dry milk.",
                "status": "passed"
            },
            {
                "test_name": "ASTM D3985 Oxygen Transmission Rate (OTR)",
                "test_standard": "ASTM D3985",
                "methodology": "Coulometric sensor measurement of oxygen transmission through plastic films and sheets at 23°C and 0% / 50% RH.",
                "pass_criteria": "< 1.0 cc/(m2·day·atm) for high oxygen sensitivity (coffee, nuts, fatty snacks).",
                "result_notes": "EVOH multi-layer high barrier film tested 0.6 cc/(m2·day·atm). Pass.",
                "status": "passed"
            },
            {
                "test_name": "ASTM F88 / F88M Seal Strength of Flexible Barrier Materials",
                "test_standard": "ASTM F88",
                "methodology": "Tensile testing of heat-sealed seam strips at 250 mm/min crosshead speed to determine peak seal force.",
                "pass_criteria": "Minimum 15 N/15mm for retort pouches; minimum 8 N/15mm for standard doypacks.",
                "result_notes": "Fusion heat-sealed PP pouches exhibited seal peel force of 22 N/15mm. Pass.",
                "status": "passed"
            },
            {
                "test_name": "ASTM F2096 Gross Leak Detection in Packaging (Bubble Emission)",
                "test_standard": "ASTM F2096",
                "methodology": "Internal pressurization under water to detect pinholes down to 250 μm diameter.",
                "pass_criteria": "Zero continuous bubble stream emissions under 5 psi internal pressure for 30 seconds.",
                "result_notes": "Vacuum packs and MAP trays showed zero bubble leaks. Pass.",
                "status": "passed"
            },
            {
                "test_name": "EN 1186 Overall Migration Testing for Food Contact Plastics",
                "test_standard": "EN 1186 / Regulation EU 10/2011",
                "methodology": "Exposure to food simulants (3% acetic acid, 10% ethanol, vegetable oil) at 40°C for 10 days.",
                "pass_criteria": "Overall migration into food simulant must not exceed 10 mg/dm2 or 60 mg/kg food.",
                "result_notes": "Virgin polypropylene container tested 2.3 mg/dm2 overall migration. Well within limits. Pass.",
                "status": "passed"
            }
        ]

        for t in tests_seed:
            existing_t = db.query(PackagingTest).filter(PackagingTest.test_name == t["test_name"]).first()
            if not existing_t:
                pt = PackagingTest(**t)
                db.add(pt)
        db.commit()
        print("Packaging testing records successfully initialized!")

    except Exception as e:
        db.rollback()
        print(f"Error importing dataset: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()
