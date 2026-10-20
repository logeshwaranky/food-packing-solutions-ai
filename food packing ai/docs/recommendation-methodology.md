# Recommendation Methodology: Food Packing Solutions AI

## 1. Core Philosophy: Safety-First Engineering Architecture
The Food Packing Solutions AI recommendation engine operates under a strict, non-negotiable principle:

> **Food-contact compliance and microbiological safety prerequisites strictly precede economic, convenience, or sustainability scoring.**

A packaging option that is cheap, recyclable, or lightweight but fails to prevent lethal anaerobic sporulation (e.g., *Clostridium botulinum* in ambient-held high-moisture foods) or fails to prevent severe chemical leaching is immediately disqualified.

---

## 2. Recommendation Pipeline

```
[User Input: NLP Query or Structured Wizard]
                  │
                  ▼
      1. Natural Language Parser
  (Extracts food, state, quantity, sensitivities)
                  │
                  ▼
     2. Food Catalogue Linkage
  (Retrieves known Aw, pH, microbial risks, O2 sens)
                  │
                  ▼
      3. Mandatory Safety Gate (Hard Filter)
  [Pass/Fail check on physics, microbiology & food contact]
         ├── FAIL ──> Disqualified with explicit technical rationale
         └── PASS ──> Proceeds to Multi-Attribute Evaluation
                  │
                  ▼
   4. Multi-Attribute Scoring Engine (0 - 100 Scale)
      - Barrier Match (0 - 40 pts)
      - Physical Format & State Fit (0 - 25 pts)
      - Shelf-Life Expectancy (0 - 15 pts)
      - Budget Alignment (0 - 10 pts)
      - Sustainability Goal (0 - 10 pts)
                  │
                  ▼
     5. Explainable Rationale Generation
      - "Why this candidate?" justification
      - Key advantages for target food
      - Honest engineering trade-offs
      - Missing evidence & laboratory testing requirements (ASTM/ISO)
                  │
                  ▼
          [Candidate Results]
```

---

## 3. Mandatory Safety Rules & Hard Filters

### Rule 1: Liquids in Porous or Unlined Substrates
- **Check**: Physical state == `Liquid`
- **Disqualification**: Any format using unlined paperboard, moulded fibre, or mesh.
- **Rationale**: Hydrostatic pressure dissolves unlined cellulose fibers within minutes, causing structural collapse and catastrophic leakage.

### Rule 2: Whole Respiring Produce under Vacuum
- **Check**: Category/State == `Fresh Produce`
- **Disqualification**: Method == `Vacuum Packaging`
- **Rationale**: Fresh fruits and vegetables continue cellular aerobic respiration post-harvest. Evacuation of oxygen triggers anaerobic fermentation, acetaldehyde and ethanol synthesis, rapid tissue softening, and foul off-odors. Requires micro-perforated Equilibrium MAP (EMAP).

### Rule 3: Ambient Extended Storage for High-Moisture Perishables
- **Check**: Moisture == `High` AND Storage == `Ambient (>20°C)` AND Shelf-Life == `Extended (>6 months)`
- **Disqualification**: Non-sterilized flexible films or standard snap tubs.
- **Mandatory**: Retort Packaging (121°C autoclave) or Aseptic processing.
- **Rationale**: High water activity ($a_w > 0.85$) and non-acid pH ($pH > 4.6$) at ambient temperature support proliferation of *Clostridium botulinum* and *Bacillus cereus*. Thermal sterilization ($F_0 \ge 3.0$ minutes) inside hermetic barrier vessels is non-negotiable.

### Rule 4: High Acid Foods in Unlacquered Metals
- **Check**: $pH < 4.5$ (e.g., Tomato sauce, pickles, citrus)
- **Disqualification**: Bare unlined tinplate/aluminum.
- **Mandatory**: Epoxy-phenolic or BPA-NI internal lacquer coating, or Glass.
- **Rationale**: Organic acids corrode exposed iron and aluminum, causing hydrogen swelling, heavy metal migration, and pinhole perforation.

### Rule 5: Hot Takeaway Food Contact Plastics
- **Check**: Serving temperature $>80^\circ\text{C}$
- **Disqualification**: Standard LDPE, unoriented polystyrene, or standard PET.
- **Mandatory**: Polypropylene (PP) or barrier-lined bagasse.
- **Rationale**: Elevated thermal energy causes thermal distortion and accelerates additive migration into fatty foods.

---

## 4. Multi-Attribute Scoring Formulation

The overall suitability score ($S$) is calculated as:

$$S = S_{\text{barrier}} + S_{\text{format}} + S_{\text{shelf}} + S_{\text{cost}} + S_{\text{sustainability}} + S_{\text{special}}$$

### A. Barrier Match ($S_{\text{barrier}}$, 0 to 40 Points)
- Base score: 25 points.
- Ultra-High overall barrier (Foil, Glass, EVOH): +15 points.
- High barrier: +10 points.
- Penalty for moisture sensitivity vs low moisture barrier: -15 points.
- Penalty for oxygen sensitivity vs low oxygen barrier: -15 points.
- Bonus for aroma scalping resistance (Glass, Alu foil) when aroma sensitivity is high: +5 points.

### B. Format & Handling Fit ($S_{\text{format}}$, 0 to 25 Points)
- Powder matching with stand-up pouches, cans, or jars: +10 points.
- Liquid matching with bottles, aseptic cartons, or hermetic jars: +10 points.
- Prepared meals matching with microwaveable PP containers or retort pouches: +10 points.
- Produce matching with ventilated corrugated or moulded pulp: +10 points.

### C. Shelf-Life Fit ($S_{\text{shelf}}$, 0 to 15 Points)
- Extended shelf life matching with Retort, Aseptic, or Cans: +5 points.
- Short turnover matching with lightweight flexible or rigid formats: +5 points.

### D. Cost Alignment ($S_{\text{cost}}$, 0 to 10 Points)
- Evaluates estimated unit cost against the user's budget constraint (Economy vs Balanced vs Premium).

### E. Sustainability Alignment ($S_{\text{sustainability}}$, 0 to 10 Points)
- Scaled from the material's circularity score (1.0 to 10.0), recyclability infrastructure, and compostability credentials.

---

## 5. Traceability and Laboratory Validation Protocols
Every candidate generated by the engine includes specific ASTM and ISO test recommendations:
- **ASTM F1249**: Water Vapor Transmission Rate (WVTR) through plastic film and sheeting using a modulated infrared sensor.
- **ASTM D3985**: Oxygen Gas Transmission Rate (OTR) through plastic film and sheeting using a coulometric sensor.
- **ASTM F88 / F88M**: Standard test method for seal strength of flexible barrier materials.
- **ASTM F2096**: Standard test method for detecting gross leaks in packaging by internal pressurization (Bubble test).
- **EN 1186**: European standard for overall migration testing into food simulants (aqueous, acidic, alcoholic, and fatty).
