import pandas as pd

df = pd.read_csv("data/processed/neutral_patterns.csv")

print("ORIGINAL pattern counts:")
print(df["pattern"].value_counts())

print("\nCORRECTED pattern counts:")
print(df["pattern_corrected"].value_counts())

agreement = (df["pattern"] == df["pattern_corrected"]).mean()
print(f"\nAgreement rate: {agreement:.2f}")
