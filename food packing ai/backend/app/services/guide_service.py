from typing import List, Dict, Any, Optional

FOOD_PROTECTION_VECTORS: List[Dict[str, Any]] = [
    {
        "id": "moisture-gain-and-loss",
        "title": "Moisture Gain and Loss",
        "icon": "Droplets",
        "causes": "Vapor pressure gradient between ambient relative humidity (RH) and the water activity (aw) of the food product through permeation or micro-leaks.",
        "effects_on_food": "Moisture gain makes crisp items (chips, cookies, crackers) soggy and stale, triggers caking in powders, and elevates aw above 0.60 enabling microbial growth. Moisture loss causes dry shriveling in fresh produce, toughening in baked goods, and freezer burn in frozen meats.",
        "packaging_properties": "Low Water Vapor Transmission Rate (WVTR < 0.5 g/m2·day), hydrophobic polymer layers (HDPE, PP, LDPE), metallized film laminates, and continuous hermetic seals.",
        "suitable_methods": [
            "Flexible Packaging with metallized barrier films (BOPP/Met-PET/PE)",
            "Thermoformed rigid PP containers with barrier lidding",
            "Hermetically sealed tinplate cans and glass jars",
            "Moisture-absorbing desiccant sachets in active packaging"
        ],
        "limitations": "Zero-permeability materials (glass, metal) add weight and cost. Micro-pinholes in folds or seal defects can destroy barrier efficacy irrespective of film thickness.",
        "storage_handling_practices": "Store products in air-conditioned, low-humidity dry warehouses (<60% RH); protect corrugated shipping cases from floor moisture and wet pallet bases."
    },
    {
        "id": "oxygen-exposure-and-oxidation",
        "title": "Oxygen Exposure and Oxidation",
        "icon": "Wind",
        "causes": "Atmospheric oxygen (20.9% O2 in ambient air) penetrating through permeable polymer webs or lingering in package headspace.",
        "effects_on_food": "Lipid peroxidation causing rancidity, off-flavors, and toxic peroxides in nuts, oils, and fried snacks; enzymatic and non-enzymatic browning; degradation of vitamins A, C, and E; aerobic spoilage by yeasts, molds, and aerobic bacteria.",
        "packaging_properties": "Low Oxygen Transmission Rate (OTR < 1.0 cc/m2·day·atm), gas-barrier resins (EVOH, PVDC, oriented polyamide PA), aluminum foil barrier layers, and vacuum tight seals.",
        "suitable_methods": [
            "Modified Atmosphere Packaging (MAP) using inert nitrogen flush (N2 > 99%)",
            "Chamber vacuum packaging to evacuate air headspace",
            "Active oxygen scavenging sachets (ferrous carbonate or enzyme based)",
            "Impermeable glass jars or tinplate cans"
        ],
        "limitations": "Oxygen scavengers have finite absorption capacities and fail if package barrier is leaky. EVOH loses oxygen barrier performance at high relative humidity (>80% RH) unless protected by outer polyolefin layers.",
        "storage_handling_practices": "Keep package headspace minimal; inspect nitrogen flush gas mixers with online headspace analyzers (Dansensor); store away from ambient heat."
    },
    {
        "id": "light-exposure",
        "title": "Light Exposure and Photo-Degradation",
        "icon": "Sun",
        "causes": "Ultraviolet (UV: 200–400 nm) and visible light (400–700 nm) from sunlight and supermarket fluorescent display lighting.",
        "effects_on_food": "Photo-oxidation of lipids; degradation of light-sensitive riboflavin (Vitamin B2 in milk generating 'cardboardy' sunlight flavor); bleaching of natural pigments (chlorophyll, anthocyanins, carotenoids); oxidation of beer isohumulones ('skunky' flavor).",
        "packaging_properties": "High optical opacity, UV-absorbing additives/masterbatches, aluminum foil metallization, amber or dark green glass tinting.",
        "suitable_methods": [
            "Aluminum foil barrier laminates (100% light block)",
            "Amber glass bottles and dark green glass jars",
            "Pigmented opaque white/black HDPE and PP bottles",
            "Paperboard secondary cartons shielding transparent primary pouches"
        ],
        "limitations": "Opaque packaging eliminates product visibility, which reduces consumer 'see-what-you-buy' purchase impulse.",
        "storage_handling_practices": "Avoid direct retail window display exposure; utilize UV-filtered LED store lighting; shield master shipping cartons during outdoor cross-docking."
    },
    {
        "id": "microbial-contamination",
        "title": "Microbial Contamination and Proliferation",
        "icon": "ShieldAlert",
        "causes": "Post-processing airborne microbes, human contact, insect vectors, or raw food cross-contamination entering open or compromised packs.",
        "effects_on_food": "Food spoilage (slime, gas production, souring, liquefaction) and lethal foodborne intoxication/infections (Salmonella, Listeria monocytogenes, Clostridium botulinum, E. coli, Bacillus cereus).",
        "packaging_properties": "Hermetic seal integrity, pinhole-free barrier membranes, aseptic barrier materials, antimicrobial coatings.",
        "suitable_methods": [
            "In-container thermal retorting (121°C sterilization)",
            "Aseptic filling inside cleanroom enclosures",
            "Modified Atmosphere Packaging with elevated CO2 (>20%) to inhibit bacterial proliferation",
            "Antimicrobial active films releasing silver ions, nisin, or essential oils"
        ],
        "limitations": "PACKAGING ALONE CANNOT STERILIZE CONTAMINATED FOOD. Packaging merely preserves microbial status achieved during cooking, pasteurization, or washing.",
        "storage_handling_practices": "Strict Good Manufacturing Practices (GMP) and HACCP sanitization; uninterrupted cold chain refrigeration (<4°C) for perishable meats, dairy, and prepared meals."
    },
    {
        "id": "physical-damage",
        "title": "Physical Impact and Compression Damage",
        "icon": "Box",
        "causes": "Drops, shocks, vibrations during road/rail freight, warehouse pallet stacking pressure, and rough distribution handling.",
        "effects_on_food": "Bruising of fresh fruits, shattering of fragile biscuits and chips, deformation of baked goods, rupture of inner vacuum pouches, flex-cracking of barrier films.",
        "packaging_properties": "Compressive rigidity, tensile puncture resistance, damping/cushioning ability, corrugated flute strength (Edge Crush Test - ECT).",
        "suitable_methods": [
            "Rigid containers, bottles, and tubs (PET, HDPE, Glass)",
            "Corrugated shipping master boxes with engineered flute structures",
            "Moulded pulp trays and egg cartons",
            "Inert gas-filled pillow pouches providing 'air cushion' pillowing (e.g. potato chip bags)"
        ],
        "limitations": "Rigid and heavy protective packaging increases tare weight, shipping fuel expenses, and packaging disposal volumes.",
        "storage_handling_practices": "Follow pallet height limits (maximum 2-3 tiers); avoid overhang on pallet edges; strap and shrink-wrap pallet loads tightly."
    },
    {
        "id": "leakage-and-spillage",
        "title": "Leakage and Spillage",
        "icon": "Pipette",
        "causes": "Defective heat seals, torque failure in screw caps, flex-crack pinholes, ultrasonic seal contamination by food particles, drop impact burst.",
        "effects_on_food": "Loss of liquid contents, sticky cross-contamination across entire shipping pallets, loss of internal MAP atmosphere, secondary microbial entry.",
        "packaging_properties": "High seal hot-tack strength, broad heat-seal temperature window, leak-proof Induction seals, elastomeric gaskets in caps.",
        "suitable_methods": [
            "Induction-sealed aluminum foil cap liners",
            "Double-seamed metal can closures",
            "Ultrasonic sealing capable of sealing through food contamination in the seal jaw",
            "Retort pouches with fusion polypropylene inner seal layers"
        ],
        "limitations": "Strong hermetic seals can make packages frustratingly difficult for elderly or young consumers to open ('wrap rage').",
        "storage_handling_practices": "Regularly calibrate heat-sealing temperature, pressure, and dwell time; conduct daily vacuum bubble leak tests (ASTM F2096)."
    },
    {
        "id": "loss-of-aroma-and-flavour",
        "title": "Loss of Aroma and Flavour (Scalping)",
        "icon": "Sparkles",
        "causes": "Diffusion of volatile aroma esters and essential oils through permeable films, or absorption of flavors into the packaging polymer matrix ('flavor scalping').",
        "effects_on_food": "Flat, stale aroma in coffee, spices, tea, and citrus juices; absorption of plasticizer smells or printing solvent residues into food.",
        "packaging_properties": "High volatile organic barrier, low flavor scalping coefficient, glass and aluminum impermeability, low-extractable food-contact polymers.",
        "suitable_methods": [
            "Foil laminate pouches (PET/Alu/PE)",
            "Glass jars with inert plastisol or fluoropolymer lined caps",
            "EVOH and oriented polyamide (OPA) barrier webs",
            "Tinplate cans with low-scalping epoxies"
        ],
        "limitations": "Standard polyethylene and polypropylene are prone to absorbing limonene and non-polar essential oils.",
        "storage_handling_practices": "Never store aromatic goods (coffee, spices) adjacent to chemical products or pungent foods; seal immediately after packaging."
    },
    {
        "id": "temperature-changes",
        "title": "Temperature Variations and Thermal Abuse",
        "icon": "ThermometerSnowflake",
        "causes": "Breaks in the cold chain during airport tarmac transit, loading docks, power failures, or unrefrigerated final-mile courier delivery.",
        "effects_on_food": "Melting and fat bloom in chocolate; ice crystallization and texture destruction in ice cream; rapid microbial proliferation in chilled meats; curdling of pasteurized dairy.",
        "packaging_properties": "Low thermal conductivity, radiant reflective surfaces, phase change material (PCM) heat sinks, insulated envelope liners.",
        "suitable_methods": [
            "Expanded Polystyrene (EPS) coolers or recyclable paper-fibre insulated mailers",
            "Phase Change Materials (PCMs), gel packs, and dry ice blankets",
            "Intelligent Time-Temperature Indicators (TTI) recording thermal abuse",
            "Vacuum Insulated Panels (VIP) for ultra-critical biologics and high-value foods"
        ],
        "limitations": "Passive thermal packaging can only maintain temperature for a finite time window (typically 24–72 hours); adds large dimensional shipping volume.",
        "storage_handling_practices": "Pre-chill foods thoroughly before packing into insulated shippers; pack calibrated gel pack ratios; monitor with USB/RFID temperature data loggers."
    },
    {
        "id": "pests-and-external-contamination",
        "title": "Pests and External Contamination",
        "icon": "Bug",
        "causes": "Penetration by storage insects (weevils, flour beetles, moth larvae) and rodents boring through paper and thin plastic bags; dust and chemical splashes.",
        "effects_on_food": "Insect webbing, frass, microbial infestation, food condemnation, brand reputation loss, and acute regulatory fines.",
        "packaging_properties": "High puncture and bite resistance (heavy gauge PET, nylon, metal, glass), smooth uncreased surfaces, insect-repellent coatings.",
        "suitable_methods": [
            "Rigid metal cans and glass jars (complete physical barrier to insects/rodents)",
            "Heavy-duty biaxially oriented PET/Nylon/PE multi-layer pouches (>100 microns)",
            "Food-grade corrugated outer cases sealed with reinforced adhesive tape",
            "Bio-based insect repellent coatings applied to outer carton board"
        ],
        "limitations": "Thin polyethylene and paper bags can easily be penetrated by insect larvae chewing along fold lines and corners.",
        "storage_handling_practices": "Implement comprehensive integrated pest management (IPM) in warehouses; store palletized goods on racks 50 cm away from perimeter walls; rotate stock with First-Expired, First-Out (FEFO)."
    }
]

def get_all_protection_guides() -> List[Dict[str, Any]]:
    return FOOD_PROTECTION_VECTORS

def get_protection_guide_by_id(guide_id: str) -> Optional[Dict[str, Any]]:
    for g in FOOD_PROTECTION_VECTORS:
        if g["id"] == guide_id:
            return g
    return None
