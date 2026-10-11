# Bhumi Vikas Sahayak · भूमि विकास सहायक

**Track 1 — Claude Impact Lab × Cerebras Café Compute, Bhopal · 11 October 2026**

Ask the MP Bhumi Vikas Rules 2012 in plain English or Hindi. Get the answer with the rule number and the exact text it came from.

**Team:** AeroNerds

**Built for:** Building-permission clerks at Bhopal Municipal Corporation.

**User story:** A citizen stands at the BMC counter and asks "My plot is 200 sq m on a 9 m road. What is the front setback, and what fee do I pay?" The clerk types the question, gets the answer (3.0 m — Rule 56(1)(a), ₹3,250 for an estimated 250 sq m built-up area — Rule 21(2)(ii) + 21(3)(b)), shows the citizen the rule number, prints the guidance slip.

---

## How to run (5 steps)

1. **Clone the repo**
   ```bash
   git clone https://github.com/utkarshgupta188/aeronerds-CI.git
   cd aeronerds-CI
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set your Cerebras API key**
   ```bash
   cp .env.example .env
   # Edit .env and set: CEREBRAS_API_KEY=your_key_here
   ```

4. **Start the server**
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```

5. **Open** `http://localhost:8000` in your browser.

---

## What it does

### Rule Assistant (नियम सहायक)
Type any question in English or Hindi. The tool retrieves the most relevant rules using TF-IDF search, sends them to Cerebras `gpt-oss-120b`, and returns the answer with:
- The rule number(s) used
- The exact rule text it drew from (expandable)
- A clear "Not found in the rules" when the rules are silent — never invents a rule

### Counter Calculator (काउंटर कैलकुलेटर)
Enter plot area, road width, building height, and type. Get instantly:
- **Front setback** — Rule 56(1)(a) table
- **Rear setback** — Rule 56(2)(a) table
- **Permission fee** — Rule 21(2)(ii) + Rule 21(3)(b) slabs (application fee ₹1/sqm + slab sanction fee)
- **Lift requirement** — Rule 83 (mandatory above 12.5 m)
- **T&CP exemption** — 28 August 2026 amendment (plots ≤ 500 sq m exempt)

All arithmetic is in code, not in the language model.

### Benchmark (सटीकता)
Table of all 17 sample questions with pre-verified answers. "Run Live" button sends all 17 to the Cerebras API and shows live results.

### Citizen Guidance Slip (नागरिक पर्ची)
Print a slip for the citizen from either the calculator or the assistant result.

---

## Accuracy on sample questions

The 17 sample questions are built into the Benchmark tab with reference answers checked against the rule text (Q1-Q15 point to a rule; Q16-Q17 are expected to return "Not found").

The **Run Live** button sends all 17 to the model and marks each result as matching or not matching the expected found / not-found outcome. It needs `CEREBRAS_API_KEY`. Run it and record your own score here before relying on it; this repo does not claim a measured accuracy figure.

---

## What works

- English and Hindi questions answered with rule number + source text shown
- Fee questions (Rule 21), setback questions (Rule 56), farm house (Rule 17), permission validity (Rule 23), electric line clearances (Rule 52), lifts (Rule 83), Development Plan precedence (Rule 103)
- Correctly says "Not found" for out-of-scope questions — never guesses
- Calculator does all fee and setback arithmetic in Python — no LLM arithmetic
- 28 August 2026 amendment to Rule 2(5)(c) covered: in the calculator, in the ticker bar, and in the LLM system prompt
- Bilingual UI — Hindi/English toggle, font resizer
- Printable citizen guidance slip

## What doesn't work / known gaps

- The Hindi PDF uses an old font that copies as garbage — Hindi query support comes from keyword expansion into English, not from reading the Hindi PDF
- Very long or compound questions sometimes get truncated; break them into one question at a time
- Requires a Cerebras API key — the calculator works without one, the assistant does not

---

## Data sources

| Source | Link |
|---|---|
| MP Bhumi Vikas Rules 2012, English, consolidated to 6 March 2025 | https://mptownplan.gov.in/NewsPDF/bvn06032025E.pdf |
| MP Bhumi Vikas Rules 2012, Hindi, consolidated to 6 March 2025 | https://mptownplan.gov.in/NewsPDF/bvn06032025H.pdf |
| Amendment of 28 August 2026 to Rule 2(5)(c) | https://teamleaseregtech.com/updates/article/59469/government-of-madhya-pradesh-amendment-to-land-development-rules |
| Problem statement, JSONL data, and sample questions | https://github.com/Laaaaksh/bhopal-impact-lab-2026 |

---

## Tech stack

| Layer | Technology |
|---|---|
| Retrieval | TF-IDF + cosine similarity (scikit-learn) with synonym and Hindi keyword expansion |
| Generation | Cerebras `gpt-oss-120b` via `cerebras-cloud-sdk` |
| Backend | FastAPI + uvicorn |
| Frontend | Single-file HTML/CSS/JS — no build step, served directly by FastAPI |
| Data | `data/bhumi_vikas_rules.jsonl` — 106 rules, one per line |

---

## API endpoints

| Endpoint | Method | Description |
|---|---|---|
| `GET /` | GET | Serves the UI |
| `POST /api/ask` | POST | `{question, top_k}` → answer with rule numbers and source text |
| `POST /api/calculate` | POST | `{plot_area, road_width, building_height, building_type, built_up_area?}` → setbacks and fees |
| `GET /api/benchmark` | GET | Runs all 17 sample questions and returns results |

---

## License

MIT — see `LICENSE`. Offered to the Government of Madhya Pradesh through MPSeDC.
