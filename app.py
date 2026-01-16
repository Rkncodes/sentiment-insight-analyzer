import streamlit as st
import pickle
import numpy as np

# Load trained model and vectorizer
with open("model/sentiment_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("model/vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

st.set_page_config(page_title="Patient Emotion Analyzer", layout="centered")

st.title("Patient Emotion Analysis & Support System")

st.write(
    "Enter patient-written text below. "
    "The system analyzes emotional sentiment and suggests supportive actions."
)

text_input = st.text_area("Patient text", height=150)

if st.button("Analyze Emotion"):
    if text_input.strip() == "":
        st.warning("Please enter some text.")
    else:
        # Vectorize input
        X = vectorizer.transform([text_input])

        # Predict sentiment
        sentiment = model.predict(X)[0]
        confidence = np.max(model.predict_proba(X))

        st.subheader("Emotion Analysis Result")
        st.write(f"**Detected sentiment:** {sentiment.capitalize()}")
        st.write(f"**Confidence:** {confidence:.2f}")

        st.subheader("Support Suggestion")

        if sentiment == "negative" and confidence > 0.7:
            st.error(
                "High emotional distress detected. "
                "Supportive follow-up or empathetic communication is recommended."
            )
        elif sentiment == "negative":
            st.warning(
                "Some negative emotion detected. "
                "Consider checking in with the patient."
            )
        elif sentiment == "neutral":
            st.info(
                "Neutral emotional state detected. "
                "Continue monitoring patient feedback."
            )
        else:
            st.success(
                "Positive emotional state detected. "
                "Maintain current supportive approach."
            )

st.caption(
    "Disclaimer: This tool provides emotion-based insights only. "
    "It does not provide medical advice, diagnosis, or treatment."
)
