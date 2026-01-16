import pandas as pd

INPUT_PATH = "data/processed/binary_sentiment.csv"
OUTPUT_PATH = "data/processed/binary_sentiment_clean.csv"

df = pd.read_csv(INPUT_PATH)

print("Before deduplication:", len(df))
print("Class distribution before:")
print(df["binary_sentiment"].value_counts())

df_clean = df.drop_duplicates(
    subset=["benefitsReview"], 
    keep="first"
).reset_index(drop=True)

print("\nAfter deduplication:", len(df_clean))
print("Removed duplicates:", len(df) - len(df_clean))
print("\nClass distribution after:")
print(df_clean["binary_sentiment"].value_counts())

df_clean.to_csv(OUTPUT_PATH, index=False)
print(f"\nSaved cleaned dataset to: {OUTPUT_PATH}")
