import pandas as pd

# Load datasets
train_df = pd.read_csv("data/raw/drugLibTrain_raw.tsv", sep="\t")
test_df = pd.read_csv("data/raw/drugLibTest_raw.tsv", sep="\t")

# Basic sanity checks
print("TRAIN SHAPE:", train_df.shape)
print("TEST SHAPE:", test_df.shape)

print("\nCOLUMNS:")
print(train_df.columns)

print("\nSAMPLE REVIEWS:")
print(train_df["benefitsReview"].head(3))

# ----------------------------
# Sentiment label creation
# ----------------------------

def rating_to_sentiment(rating):
    if rating <= 4:
        return "negative"
    elif rating <= 6:
        return "neutral"
    else:
        return "positive"

train_df["sentiment"] = train_df["rating"].apply(rating_to_sentiment)
test_df["sentiment"] = test_df["rating"].apply(rating_to_sentiment)

print("\nSENTIMENT DISTRIBUTION (TRAIN):")
print(train_df["sentiment"].value_counts())

print("\nSENTIMENT DISTRIBUTION (TEST):")
print(test_df["sentiment"].value_counts())

from sklearn.model_selection import train_test_split

# --------------------------------
# Combine train + test (for controlled splitting)
# --------------------------------
full_df = pd.concat([train_df, test_df], ignore_index=True)

print("\nFULL DATASET SHAPE:", full_df.shape)

# --------------------------------
# Stratified train / val / test split
# 70% train, 15% val, 15% test
# --------------------------------

X = full_df["benefitsReview"]
y = full_df["sentiment"]

# First split: train vs temp
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y,
    test_size=0.30,
    stratify=y,
    random_state=42
)

# Second split: val vs test
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp,
    test_size=0.50,
    stratify=y_temp,
    random_state=42
)

print("\nSPLIT SIZES:")
print("Train:", X_train.shape[0])
print("Validation:", X_val.shape[0])
print("Test:", X_test.shape[0])

print("\nTRAIN SENTIMENT DISTRIBUTION:")
print(y_train.value_counts())

print("\nVALIDATION SENTIMENT DISTRIBUTION:")
print(y_val.value_counts())

print("\nTEST SENTIMENT DISTRIBUTION:")
print(y_test.value_counts())
