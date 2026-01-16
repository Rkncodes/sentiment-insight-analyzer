import pandas as pd
import os

# -----------------------------
# Load test predictions
# -----------------------------
INPUT_PATH = "data/processed/test_predictions.csv"
OUTPUT_PATH = "data/processed/neutral_patterns.csv"

if not os.path.exists(INPUT_PATH):
    raise FileNotFoundError(f"{INPUT_PATH} not found. Run 02_modeling.py first.")

df = pd.read_csv(INPUT_PATH)

# -----------------------------
# Filter misclassified neutral samples
# -----------------------------
neutral_errors = df[
    (df["true_label"] == "neutral") &
    (df["predicted_label"] != "neutral")
].reset_index(drop=True)

print(f"\nTotal misclassified neutral samples: {len(neutral_errors)}")
print("=" * 80)

coded_rows = []

MAX_SAMPLES = min(30, len(neutral_errors))

for i in range(MAX_SAMPLES):
    row = neutral_errors.loc[i]

    print(f"\nSample {i+1}/{MAX_SAMPLES}")
    print("-" * 80)
    print("TEXT:")
    print(row["text"][:500])
    print("\nMODEL PREDICTED:", row["predicted_label"])
    print("-" * 80)

    print("""
Pattern type:
1 = Mislabeled (clearly positive or negative, not neutral)
2 = Mixed sentiment (both pros and cons present)
3 = Factual / objective (clinical description, no emotion)
4 = Unclear / other
""")

    choice = input("Enter 1 / 2 / 3 / 4: ").strip()

    pattern_map = {
        "1": "mislabeled",
        "2": "mixed_sentiment",
        "3": "factual_objective",
        "4": "unclear"
    }

    pattern = pattern_map.get(choice, "unclear")

    coded_rows.append({
        "text": row["text"],
        "true_label": row["true_label"],
        "predicted_label": row["predicted_label"],
        "pattern": pattern
    })

    # Save progress every 5 samples
    if (i + 1) % 5 == 0:
        pd.DataFrame(coded_rows).to_csv(OUTPUT_PATH, index=False)
        print(f"\nProgress saved ({i+1}/{MAX_SAMPLES})")

# -----------------------------
# Final save
# -----------------------------
coded_df = pd.DataFrame(coded_rows)
coded_df.to_csv(OUTPUT_PATH, index=False)

print("\n" + "=" * 80)
print("PATTERN CODING COMPLETE")
print(coded_df["pattern"].value_counts())
print(f"\nSaved to: {OUTPUT_PATH}")
