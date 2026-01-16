import pandas as pd

df = pd.read_csv("data/processed/neutral_patterns.csv")

print("Pattern counts:")
print(df["pattern"].value_counts())

if "pattern_corrected" in df.columns:
    print("\nCorrected pattern counts:")
    print(df["pattern_corrected"].value_counts())

    agreement = (df["pattern"] == df["pattern_corrected"]).mean()
    print(f"\nAgreement rate: {agreement:.2f}")
else:
    print("\nNo corrected column found — this is fine.")
