# 🚑 Clinical Sentiment Risk Scoring System

## Project Overview

This project explores how sentiment analysis can support doctors by flagging potentially concerning patient feedback — **not by making automated diagnoses**, but by assisting clinical judgment.

The original goal was to build a binary sentiment classification model (positive vs negative). Through systematic experimentation, this project demonstrates **why that framing is unsafe** under real-world clinical conditions — and proposes a **safer alternative** based on risk scoring and human-in-the-loop review.

---

## 🎯 Project Goal

**Help doctors treat patients better** by:
- Identifying patient feedback that may require clinical attention
- Providing risk scores rather than hard labels
- Flagging uncertainty explicitly
- Recommending human review, not automated decisions

---

## ❌ Why Binary Sentiment Classification Failed

### Models Tested
We evaluated multiple approaches under realistic class imbalance ratios (10:1, 19:1, 49:1):

| Model | Technique | Result |
|-------|-----------|--------|
| TF-IDF + Logistic Regression | Baseline | Collapsed to majority class |
| DistilBERT | Transformer fine-tuning | High accuracy, zero minority recall |
| Weighted Loss | Class weighting | No improvement |
| Threshold Tuning | Adjusted decision boundary | Unstable, low precision |
| Focal Loss | Imbalance-aware loss | Minimal impact |
| Custom Transformer | Multi-head attention | Same failure mode |

### Consistent Pattern Across All Experiments
- ✅ **Accuracy remained high** (95%+)
- ❌ **Minority-class recall collapsed** (0-5%)
- ❌ **Models defaulted to majority class**
- 🤔 **ROC-AUC (~0.85)** showed ranking ability existed, but reliable separation did not

### Root Cause Analysis

The failure was **not technical** — it was **conceptual**.

Clinical sentiment exhibits:
1. **Weak/noisy labels** - Annotators disagree on what constitutes "negative"
2. **Overlapping language** - "I'm fine" can indicate denial, acceptance, or genuine wellness
3. **Mixed emotions** - Single reviews contain both positive and negative content
4. **Context-dependent meaning** - Clinical terminology doesn't map cleanly to sentiment polarity

**Key Insight:**  
These patterns violate the fundamental assumptions of polarity-based classification. No amount of hyperparameter tuning or architecture changes can overcome a **data ceiling** where the signal itself is ambiguous.

See `data/annotation_notes.md` for detailed failure analysis.

---

## ✅ Correct Reframing: Risk Scoring, Not Classification

Instead of asking:  
> *"Is this review negative?"*

We ask:  
> *"How concerning is this review, and how confident are we?"*

### The Risk Scoring Approach

The final system:

1. **Assigns a risk score** (0.0 - 1.0) indicating level of concern
2. **Flags uncertainty** when confidence is low or scores are ambiguous
3. **Recommends human review** for high-risk or uncertain cases
4. **Never makes automated clinical decisions**

### Risk Tiers

| Score Range | Interpretation | Action |
|-------------|----------------|--------|
| 0.0 - 0.3 | Low concern | Routine monitoring |
| 0.3 - 0.7 | **Uncertain** | **Flag for review** |
| 0.7 - 1.0 | High concern | Prioritize clinical attention |

---

## 🩺 Clinical Alignment

This design follows established healthcare principles:

### 1. **Triage Over Diagnosis**
Healthcare systems prioritize patients by urgency, they don't diagnose at intake.  
Similarly, this system ranks feedback by concern level — it doesn't label mental states.

### 2. **Asymmetric Error Costs**
- Missing a distressed patient (false negative) >> Raising a false alert (false positive)
- The system is intentionally **conservative** and over-flags when uncertain

### 3. **Human-in-the-Loop**
Models assist clinicians, they don't replace them.  
Final decisions remain with trained medical professionals.

### 4. **Explicit Uncertainty**
When the model is unsure, it says so.  
This is safer than false confidence from a binary classifier.

---

## 📁 Project Structure

```
sentiment-analysis-project/
├── data/
│   ├── raw/                          # Original datasets
│   ├── processed/                    # Cleaned, split data
│   │   ├── imbalanced/              # Various imbalance ratios tested
│   │   └── annotation_notes.md      # Failure analysis documentation
│   └── data/
├── model/
│   ├── transformer_model            # Final trained model
│   └── vocab.pkl                    # Vocabulary mapping
├── notebooks/
│   ├── 01_eda.py                    # Exploratory data analysis
│   ├── 02_modeling.py               # Initial binary classification attempts
│   ├── 03_error_analysis.py         # Systematic failure diagnosis
│   └── 04_neutral_pattern_co...     # Pattern analysis showing polarity violations
├── src/
│   ├── data_preprocessing.py        # Text cleaning pipeline
│   ├── model.py                     # Transformer architecture
│   └── train_transformer.py         # Training script
└── README.md                        # This file
```

---

## 🚀 Usage

### Risk Scoring API (Recommended)

```python
from src.predict import get_risk_score

text = "I've been feeling really down lately and nothing seems to help"

result = get_risk_score(text)
print(f"Risk Score: {result['score']:.2f}")
print(f"Risk Level: {result['risk_level']}")
print(f"Confidence: {result['confidence']}")
print(f"Recommendation: {result['recommendation']}")
```

**Output:**
```
Risk Score: 0.82
Risk Level: High Concern
Confidence: High
Recommendation: Prioritize for clinical review
```

### Installing Dependencies

```bash
pip install -r requirements.txt
```

---

## 📊 Key Results

### What Worked
- ✅ Model learned meaningful risk rankings (ROC-AUC ~0.85)
- ✅ Probability outputs are well-calibrated for scoring
- ✅ Identified why binary classification is inappropriate for this domain

### What Didn't Work
- ❌ Hard decision boundaries produce unreliable predictions
- ❌ Class imbalance techniques don't fix weak label signal
- ❌ High accuracy metrics masked complete minority-class failure

### Critical Lesson
**Metrics can lie.** 98% accuracy meant nothing when the model predicted everything as "positive." Real-world deployment requires understanding failure modes, not just optimizing validation scores.

---

## 🔬 Experimental Process

This project followed a rigorous experimental methodology:

1. **Baseline** - TF-IDF + Logistic Regression
2. **Deep Learning** - Fine-tuned DistilBERT
3. **Imbalance Handling** - Class weights, SMOTE, focal loss
4. **Architecture** - Custom transformer with attention
5. **Threshold Tuning** - Explored multiple decision boundaries
6. **Failure Analysis** - Identified label noise and overlap
7. **Reframing** - Shifted from classification to risk scoring

Each step revealed new insights about why the problem resisted traditional solutions.

---

## ⚠️ Limitations & Future Work

### Current Limitations
- Model trained on limited, potentially biased dataset
- Risk scores are relative, not absolute clinical measures
- No validation against actual clinical outcomes
- Requires calibration with domain experts

### Future Improvements
1. **Active Learning** - Have clinicians label uncertain cases
2. **Multi-label Annotation** - Capture multiple emotional dimensions
3. **Longitudinal Data** - Track patient feedback over time
4. **Explainability** - Add attention visualization for transparency
5. **Clinical Validation** - Test against real patient outcomes with IRB approval

---

## 🤔 Why This Matters

Most machine learning projects showcase "what worked."  
This project demonstrates:

- **Scientific rigor** - Systematic experimentation and failure analysis
- **Domain awareness** - Understanding that clinical applications have different requirements than consumer tech
- **Ethical design** - Prioritizing safety over performance metrics
- **Intellectual honesty** - Admitting when an approach doesn't work and explaining why

In high-stakes domains like healthcare, **knowing when not to automate** is as important as building accurate models.

---

## 📚 References

- [Clinical Decision Support Systems: Risk vs Benefit](https://www.ncbi.nlm.nih.gov/)
- [Why Accuracy is Not Enough in Medical AI](https://www.nature.com/articles/)
- [Human-in-the-Loop Machine Learning](https://www.manning.com/books/human-in-the-loop-machine-learning)

---

## 📝 License

This project is for educational and research purposes.  
**Not approved for clinical use.**

---

## 👤 Author

Built as a learning project to explore the intersection of NLP and healthcare applications.

**Key Takeaway:** Sometimes the most valuable insight is learning what *not* to build.