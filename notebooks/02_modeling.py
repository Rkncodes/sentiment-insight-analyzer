import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.utils.class_weight import compute_class_weight
import numpy as np

# ----------------------------
# Load preprocessed data
# ----------------------------

train_df = pd.read_csv("data/raw/drugLibTrain_raw.tsv", sep="\t")
test_df = pd.read_csv("data/raw/drugLibTest_raw.tsv", sep="\t")

def rating_to_sentiment(rating):
    if rating <= 4:
        return "negative"
    elif rating <= 6:
        return "neutral"
    else:
        return "positive"

train_df["sentiment"] = train_df["rating"].apply(rating_to_sentiment)
test_df["sentiment"] = test_df["rating"].apply(rating_to_sentiment)

full_df = pd.concat([train_df, test_df], ignore_index=True)

# ----------------------------
# Remove rows with missing text
# ----------------------------

full_df = full_df.dropna(subset=["benefitsReview"])

# Combine multiple patient text fields
full_df["combined_text"] = (
    full_df["benefitsReview"].fillna("") + " " +
    full_df["sideEffectsReview"].fillna("") + " " +
    full_df["commentsReview"].fillna("")
)

X = full_df["combined_text"]

y = full_df["sentiment"]

print("After removing NaNs, dataset size:", full_df.shape)


from sklearn.model_selection import train_test_split

X_train, X_temp, y_train, y_temp = train_test_split(
    X, y,
    test_size=0.30,
    stratify=y,
    random_state=42
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp,
    test_size=0.50,
    stratify=y_temp,
    random_state=42
)

# ----------------------------
# Class weights (imbalance handling)
# ----------------------------

classes = np.unique(y_train)
weights = compute_class_weight(
    class_weight="balanced",
    classes=classes,
    y=y_train
)
class_weights = dict(zip(classes, weights))

print("Class weights:", class_weights)

# ----------------------------
# TF-IDF + Logistic Regression
# ----------------------------

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        max_features=20000,
        ngram_range=(1, 2),
        stop_words="english",
        min_df=5
    )),
    ("clf", LogisticRegression(
        max_iter=1000,
        class_weight=class_weights,
        n_jobs=-1
    ))
])

# ----------------------------
# Train model
# ----------------------------

pipeline.fit(X_train, y_train)

# ----------------------------
# Evaluation on test set
# ----------------------------

y_pred = pipeline.predict(X_test)

print("\nCLASSIFICATION REPORT (TEST SET):")
print(classification_report(y_test, y_pred))

print("\nCONFUSION MATRIX:")
print(confusion_matrix(y_test, y_pred))

import joblib
import os

# ----------------------------
# Save trained model pipeline
# ----------------------------
os.makedirs("models", exist_ok=True)

joblib.dump(pipeline, "models/sentiment_pipeline.joblib")

print("\nModel saved to models/sentiment_pipeline.joblib")

import pandas as pd

# Save predictions for analysis
results_df = pd.DataFrame({
    "text": X_test,
    "true_label": y_test,
    "predicted_label": y_pred
})

results_df.to_csv("data/processed/test_predictions.csv", index=False)
print("Saved test predictions for error analysis.")
