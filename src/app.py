import os

import streamlit as st
from dotenv import load_dotenv

load_dotenv()

from src.embedder import embed_rules, search
from src.answerer import answer

DATA_PATH = "data/bhumi_vikas_rules.jsonl"

st.set_page_config(page_title="Bhumi Vikas Sahayak", page_icon="🏗️", layout="centered")

st.title("Bhumi Vikas Sahayak · भूमि विकास सहायक")
st.caption("Ask the MP Bhumi Vikas Rules 2012 — get an answer with the rule number · नियम संख्या के साथ उत्तर पाएं")

if "rules" not in st.session_state:
    with st.spinner("Loading rules index..."):
        st.session_state.rules, st.session_state.vectorizer = embed_rules(DATA_PATH)

question = st.text_input(
    "Your question / आपका प्रश्न",
    placeholder="e.g. My plot is 200 sq m on a 9 m road. What is the front setback?",
)

if question.strip():
    with st.spinner("Searching rules..."):
        chunks = search(question, st.session_state.rules, st.session_state.vectorizer, top_k=5)
        result = answer(question, chunks)

    if result.get("error"):
        st.error(result["answer_text"])
    elif result["not_found"]:
        st.warning("**Not found in the rules.** The MP Bhumi Vikas Rules 2012 (consolidated to 6 March 2025) do not appear to address this question.")
    else:
        st.success(result["answer_text"])
        if result["rule_numbers"]:
            st.markdown(f"**Rule(s) cited:** {', '.join(result['rule_numbers'])}")

    if not result.get("error") and result["source_excerpts"]:
        with st.expander("Source rules used"):
            for excerpt in result["source_excerpts"]:
                st.markdown(excerpt)
                st.divider()

st.markdown("---")
st.caption("Based on MP Bhumi Vikas Rules 2012, consolidated to **6 March 2025**. Amendments after 6 March 2025 are not included — verify against the current gazette. Not legal advice. The clerk decides; this tool points to the rule.")
