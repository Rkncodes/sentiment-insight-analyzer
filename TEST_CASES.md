# Sentiment Analysis – Test Cases

## Test 1: Low mood / fatigue
Input:
I feel tired most days, my energy feels low and I struggle to focus, but I can still manage my routine.

Expected:
- Sentiment: Low mood or fatigue
- Severity: Mild
- Confidence: ~0.4–0.6

---

## Test 2: Neutral
Input:
My days feel normal. Nothing particularly good or bad, just regular work and usual responsibilities.

Expected:
- Sentiment: Neutral / stable
- Severity: Mild
- Confidence: ~0.5+

---

## Test 3: Positive
Input:
I’m excited about learning new things, motivated to improve, and confident about my progress lately.

Expected:
- Sentiment: Positive / motivated
- Severity: Low
- Confidence: ~0.8–0.95

---

## Test 4: Moderate distress
Input:
Lately I feel overwhelmed and confused, like things are piling up and I can’t think clearly.

Expected:
- Sentiment: Emotional distress / overwhelmed
- Severity: Moderate
- Confidence: ~0.5–0.7

---

## Test 5: High emotional distress
Input:
I feel completely hopeless, nothing seems to matter anymore and I don’t see a way forward.

Expected:
- Sentiment: High emotional distress
- Severity: High
- Confidence: ~0.6–0.8
