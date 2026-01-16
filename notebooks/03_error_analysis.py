import pandas as pd

df = pd.read_csv("data/processed/test_predictions.csv")

neutral = df[df["true_label"] == "neutral"]

print("Neutral samples:", len(neutral))
print("\nHow neutral was predicted:")
print(neutral["predicted_label"].value_counts())

print("\n--- Neutral → Predicted POSITIVE examples ---")
print(neutral[neutral["predicted_label"] == "positive"]["text"].head(5))

print("\n--- Neutral → Predicted NEGATIVE examples ---")
print(neutral[neutral["predicted_label"] == "negative"]["text"].head(5))
