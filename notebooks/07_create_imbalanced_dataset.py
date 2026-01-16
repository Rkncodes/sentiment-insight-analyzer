import pandas as pd
from pathlib import Path

INPUT_PATH = "data/processed/binary_sentiment_clean.csv"
OUTPUT_DIR = "data/processed/imbalanced"

def create_imbalanced_dataset(
    target_ratio,
    minority_label="negative",
    label_col="binary_sentiment",
    random_state=42
):
    df = pd.read_csv(INPUT_PATH)

    majority = df[df[label_col] != minority_label]
    minority = df[df[label_col] == minority_label]

    n_minority = len(majority) // target_ratio
    minority_sampled = minority.sample(
        n=min(n_minority, len(minority)),
        random_state=random_state
    )

    df_imbalanced = (
        pd.concat([majority, minority_sampled])
        .sample(frac=1, random_state=random_state)
        .reset_index(drop=True)
    )

    OUTPUT_DIR_PATH = Path(OUTPUT_DIR)
    OUTPUT_DIR_PATH.mkdir(parents=True, exist_ok=True)

    output_path = OUTPUT_DIR_PATH / f"binary_sentiment_{target_ratio}to1.csv"
    df_imbalanced.to_csv(output_path, index=False)

    print(f"\nSaved: {output_path}")
    print("Class distribution:")
    print(df_imbalanced[label_col].value_counts())
    print(df_imbalanced[label_col].value_counts(normalize=True))


if __name__ == "__main__":
    create_imbalanced_dataset(10)
    create_imbalanced_dataset(19)
    create_imbalanced_dataset(49)
