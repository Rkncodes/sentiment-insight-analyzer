import pandas as pd

df = pd.read_csv("data/raw/drugLibTrain_raw.tsv", sep="\t")

# Binary mapping
def rating_to_binary(r):
    return "negative" if r <= 4 else "positive"

df["binary_sentiment"] = df["rating"].apply(rating_to_binary)

# Use benefitsReview only (consistent with earlier work)
df = df[["benefitsReview", "binary_sentiment"]].dropna()

print(df["binary_sentiment"].value_counts())

df.to_csv("data/processed/binary_sentiment.csv", index=False)
print("Saved: data/processed/binary_sentiment.csv")
