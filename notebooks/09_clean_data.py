import pandas as pd

INPUT_PATH = "data/processed/binary_sentiment.csv"
OUTPUT_PATH = "data/processed/binary_sentiment_clean.csv"

df = pd.read_csv(INPUT_PATH)
print(f"Original samples: {len(df)}")

# 1. Remove duplicates
df_clean = df.drop_duplicates(
    subset=["benefitsReview"],
    keep="first"
).reset_index(drop=True)

print(f"After removing duplicates: {len(df_clean)}")
print(f"Removed duplicates: {len(df) - len(df_clean)}")

# 2. Inspect very short reviews (DO NOT REMOVE YET)
short_reviews = df_clean[df_clean["benefitsReview"].str.len() < 10]

print("\nVery short reviews (<10 chars):")
print(short_reviews["benefitsReview"].value_counts())
print("\nShort review class distribution:")
print(short_reviews["binary_sentiment"].value_counts())

# 3. Final distribution (unchanged)
print("\nFinal class distribution:")
print(df_clean["binary_sentiment"].value_counts())
print(df_clean["binary_sentiment"].value_counts(normalize=True))

# Save cleaned dataset (duplicates removed only)
df_clean.to_csv(OUTPUT_PATH, index=False)
print(f"\nSaved cleaned dataset to: {OUTPUT_PATH}")
