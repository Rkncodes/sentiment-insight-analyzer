import pandas as pd

df = pd.read_csv("data/processed/binary_sentiment.csv")

print("Total samples:", len(df))
print("Duplicates:", df.duplicated(subset=["benefitsReview"]).sum())
print("Missing values:\n", df.isnull().sum())

print("Empty texts:",
      (df["benefitsReview"].str.strip() == "").sum())

print("\nText length stats:")
print(df["benefitsReview"].str.len().describe())

print("\nVery short (<10 chars):",
      (df["benefitsReview"].str.len() < 10).sum())

print("\nClass distribution:\n",
      df["binary_sentiment"].value_counts())
