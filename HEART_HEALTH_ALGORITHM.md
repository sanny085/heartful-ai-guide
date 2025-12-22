# Heart Health Assessment Methodology: The Hybrid Engine

## Executive Summary
This document outlines the algorithmic logic powering the **10000Hearts Health Assessment Engine**. 

Our prediction model utilizes a **Hybrid Framingham Approach**, differentiating it from generic wellness apps and rigid medical calculators. We combine the **gold-standard Framingham Risk Score (FRS)**—verified by cardiologists and aligned with **American College of Cardiology (ACC)** guidelines—with a proprietary **Lifestyle Modification Layer** to account for modern behavioral factors (sleep, stress, diet) often overlooked in pure clinical models.

---

## 1. Core Clinical Algorithm (The "Science")
The foundation of our assessment is the **Framingham General Cardiovascular Risk Profile (2008)**, specifically the "Non-Laboratory" model which allows for accurate risk estimation using BMI when lipid panels are unavailable.

### Reference
*D’Agostino, R.B., et al. (2008). "General Cardiovascular Risk Profile for Use in Primary Care: The Framingham Heart Study." Circulation.*

### Implementation Details
We calculate the **10-Year Cardiovascular Disease (CVD) Risk Probability** using the following regression coefficients:

*   **Inputs:** Age, Gender, Systolic Blood Pressure (SBP), BMI, Smoking Status, Diabetes Status.
*   **Logic:** 
    1.  Calculate `Beta * X` using gender-specific natural log coefficients (lnAge, lnBMI, lnSBP).
    2.  Compute risk probability relative to the population mean and baseline survival rates.
    3.  **Result:** A raw percentage chance (e.g., `5.4%`) of a cardiovascular event in the next 10 years.

---

## 2. Heart Age Calculation
Unlike traditional "gamified" apps that only add penalties, our engine allows users to achieve a Heart Age **younger** than their biological age, providing positive reinforcement for healthy behaviors.

### The "Ideal Person" Method
1.  **Calculate User Risk:** We compute the user's specific 10-Year CVD Risk %.
2.  **Synthetic Benchmark:** We algorithmically search for the age at which a person with **Ideal Health Markers** (BMI 22.5, SBP 115, Non-Smoker, No Diabetes) would have that same risk.
3.  **Result:** If a 50-year-old user has the risk profile of an ideal 40-year-old, their **Base Heart Age is 40**.

---

## 3. The "Hybrid" Lifestyle Layer
Clinical algorithms often lag in reflecting immediate lifestyle choices. A user who sleeps 4 hours a night has higher risk even if their BMI is currently normal (risk "in the pipeline"). To address this, we apply **Weighted Modifiers** to the Base Heart Age.

| Factor | Impact | Rationale |
| :--- | :--- | :--- |
| **Quality Sleep** | `-1 Year` (Bonus) | Optimization of circadian rhythm and reduced cortisol. |
| **Poor Sleep (<6h)** | `+1 Year` (Penalty) | Associated with hypertension and inflammation precursors. |
| **Diet Quality** | `+/- 2 Years` | Reflects inflammatory load (High-Carb/Sugar vs. Balanced). |
| **Activity Level** | `+/- 2 Years` | Sedentary behavior is an independent risk factor beyond just BMI. |
| **Symptomatology** | `+1-3 Years` | Direct modifiers for Angina/Dyspnea symptoms which elevate immediate concern. |

---

## 4. Risk Classification Standard
Our output "Risk Score" aligns with the **ACC/AHA Guideline on the Assessment of Cardiovascular Risk**:

*   **< 5% (Low Risk):** "Green" status. Emphasis on maintaining lifestyle.
*   **5% - 7.5% (Borderline Risk):** Prompt for lifestyle optimization.
*   **7.5% - 20% (Intermediate Risk):** Strong recommendation for medical consultation.
*   **> 20% (High Risk):** "Red" status. Urgent recommendation for professional intervention.

---

## 5. Validation & Safety
*   **Non-Diagnostic:** The application clearly states it is a **Screening Tool**, not a Diagnostic Device.
*   **Fail-Safes:** Users reporting "Chest Pain" or "Shortness of Breath" receive an immediate high-risk modifier regardless of their BMI/Age, ensuring safety-critical symptoms are never masked by "good numbers."
*   **Lipid Integration:** The algorithm automatically upgrades precision if Lipid Panel data (LDL/HDL) is provided, switching from the BMI-based model to the Lipid-based Framingham model.

---

## Conclusion
By layering **Validated Clinical Science** with **Behavioral Intelligence**, 10000Hearts delivers a metric that is:
1.  **Medically Credible:** Doctors respect the Framingham base.
2.  **User Centric:** Users are motivated by "Heart Age" and lifestyle responsiveness.
3.  **Actionable:** It bridges the gap between daily habits and long-term health outcomes.
