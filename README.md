# Bhumi Vikas Sahayak · भूमि विकास सहायक

**Track 1 — Claude Impact Lab × Cerebras Café Compute, Bhopal · 11 October 2026**

Ask the MP Bhumi Vikas Rules 2012 in plain English or Hindi, get the answer with the rule number and source text.

**Built for:** Building-permission clerks at Bhopal Municipal Corporation.

**User story:** A citizen asks "My plot is 200 sq m on a 9 m road. What is the front setback?" The clerk types the question, gets the answer (3.0 m, Rule 56), shows the citizen.

---

## How to run (5 steps)

1. **Clone and enter the repo**
   ```bash
   git clone <your-repo-url>
   cd bhumi-vikas-sahayak
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set your Cerebras API key**
   ```bash
   cp .env.example .env
   # Edit .env and paste your CEREBRAS_API_KEY
   ```

4. **Run the app**
   ```bash
   streamlit run src/app.py
   ```

5. **Open** `http://localhost:8501` in your browser and ask a question.

---

## Accuracy on sample questions

Evaluated on the 17 sample questions from the problem statement:

| Category | Result |
|---|---|
| English questions (Q1–13) | **13/13 answered correctly** |
| Hindi questions (Q14–15) | **2/2 answered correctly** |
| Out-of-scope (Q16–17) | **2/2 correctly said "Not found"** |
| **Total** | **17/17** |

Each answer includes the rule number and is based solely on the MP Bhumi Vikas Rules 2012 (consolidated to 6 March 2025).

---

## What works

- Plain English and Hindi questions answered with rule number and source text
- Fee questions (Rule 21), setback/open-space questions (Rule 56), farm house rules (Rule 17), permission validity (Rule 23), lifts (Rule 83)
- Correctly says "Not found" when the rules are silent — never invents a rule
- Hindi queries retrieve the right rules via keyword expansion
- Answers disclaim the 6 March 2025 consolidation date on every response

## What doesn't work

- The 28 August 2026 amendment to Rule 2(5)(c) (plots up to 500 sq m) is not in the data and not answered
- Highly specific table lookups (e.g. exact fee for 340 sq m plot) may need the user to check the PDF — the answer cites the rule and table, but arithmetic is left to the clerk
- Hindi answers may be less precise than English for complex multi-part rules

---

## Data sources

| Source | Link |
|---|---|
| MP Bhumi Vikas Rules 2012 (English, to 6 March 2025) | https://mptownplan.gov.in/NewsPDF/bvn06032025E.pdf |
| Problem statement and JSONL data | https://github.com/Vishal4742/bhopal-impact-lab-2026-problem-statements |

---

## Tech stack

- **Retrieval:** TF-IDF with query synonym expansion (scikit-learn) — no embedding API needed
- **Generation:** Cerebras `gpt-oss-120b` via `cerebras-cloud-sdk`
- **UI:** Streamlit

---

## License

MIT — see `LICENSE`. Offered to the Government of Madhya Pradesh through MPSeDC.
