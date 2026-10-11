# Bhumi Vikas Sahayak · भूमि विकास सहायक

**Track 1 — Claude Impact Lab × Cerebras Café Compute, Bhopal · 11 October 2026**

Ask the MP Bhumi Vikas Rules 2012 in plain English or Hindi. Get the answer with the rule number and the exact text it came from.

**Team:** AeroNerds

**Members:** _add the 4–5 team member names here before submitting_

**UI:** the React app in `frontend/` (assistant, calculator, latest updates, clerk login, amendment manager). The FastAPI backend serves only `/api/*`.

**Built for:** Building-permission clerks at Bhopal Municipal Corporation.

**User story:** A citizen stands at the BMC counter and asks "My plot is 200 sq m on a 9 m road. What is the front setback, and what fee do I pay?" The clerk types the question, gets the answer (3.0 m — Rule 56(1)(a), ₹3,250 for an estimated 250 sq m built-up area — Rule 21(2)(ii) + 21(3)(b)), shows the citizen the rule number, prints the guidance slip.

---

**Live:** https://bhumi.utkarshgupta.qzz.io

## How to run locally

1. **Clone and install**
   ```bash
   git clone https://github.com/utkarshgupta188/aeronerds-CI.git
   cd aeronerds-CI
   pip install -r requirements.txt
   ```

2. **Set your Cerebras API key**
   ```bash
   cp .env.example .env
   # Edit .env and set: CEREBRAS_API_KEY=your_key_here
   ```

3. **Start the backend** (port 8000)
   ```bash
   uvicorn backend.main:app --port 8000
   ```

4. **Start the frontend** (Node 20+, port 5173; proxies `/api` to the backend)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Open** `http://localhost:5173` (portal-style landing page; the tool itself is at `http://localhost:5173/#app`).

## Repository structure

```
backend/main.py          FastAPI app: /api/ask, /api/calculate, /api/rules
src/embedder.py          TF-IDF retrieval + synonym and Hindi keyword expansion
src/answerer.py          Cerebras gpt-oss-120b answerer (EN / HI / Hinglish, NOT_FOUND detection)
data/                    106 rules as JSONL + full text by page
frontend/                React + Vite UI (assistant, calculator, latest updates, amendment manager)
tests/                   pytest: retrieval + answerer
eval.py                  Runs the 17 sample questions from the command line
deploy/                  EC2 setup + redeploy scripts, systemd unit
nginx/bhumi.conf         nginx site: serves frontend/dist, proxies /api to port 8010
```

## Tests

```bash
pytest tests/ -v      # answerer tests need CEREBRAS_API_KEY
python eval.py        # 17 sample questions
```

## Deployment (AWS EC2, no Docker)

Ubuntu 24.04, nginx serves the built frontend, systemd runs uvicorn on `127.0.0.1:8010`.

```bash
git clone https://github.com/utkarshgupta188/aeronerds-CI.git ~/aeronerds-CI
cd ~/aeronerds-CI
bash deploy/setup.sh     # first time: packages, venv, build, nginx, systemd, HTTPS
bash deploy/update.sh    # every redeploy: pull, build, restart, health check
```

Point the domain's A record at the instance's public IP, and open ports 80 and 443.

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

### Citizen Guidance Slip (नागरिक पर्ची)
Print a slip for the citizen from either the calculator or the assistant result.

### Clerk login and Amendments (संशोधन)
Clerks sign in with Firebase Authentication (email/password). In the Manage Amendments tab, which exists only after sign-in, they pick a rule from the list, then record the effective date, title and text. Each amendment has an on/off switch. Amendments are stored in Firestore and sync live. Active amendments are sent with every question and the model is told they take precedence over the base rules. Citizens see them read-only in a Latest Updates tab that appears only when at least one amendment is active. Only signed-in clerks can write (Firestore security rules).

---

## Accuracy on sample questions

Run `python eval.py` to send the 17 sample questions to the model (needs `CEREBRAS_API_KEY`). Q1-Q15 should cite a rule; Q16-Q17 are out of scope and should return "Not found". Record your own score before relying on it; this repo does not claim a measured accuracy figure.

---

## What works

- English and Hindi questions answered with rule number + source text shown
- Fee questions (Rule 21), setback questions (Rule 56), farm house (Rule 17), permission validity (Rule 23), electric line clearances (Rule 52), lifts (Rule 83), Development Plan precedence (Rule 103)
- Correctly says "Not found" for out-of-scope questions — never guesses
- Calculator does all fee and setback arithmetic in Python — no LLM arithmetic
- 28 August 2026 amendment to Rule 2(5)(c) covered: in the calculator and in the LLM system prompt
- Bilingual UI — Hindi/English toggle; Hinglish questions answered in Hinglish
- Clerk-recorded amendments flow into every answer
- Printable citizen guidance slip

## What doesn't work / known gaps

- **Calculator scope:** setbacks use the Rule 56 tables, which apply to residential buildings up to 12.5 m. Taller or non-residential buildings show "not computed" with the rule to check (Rule 42 Tables 4–5, Rule 57). Fees use the Rule 21(3)(b) schedule up to 30 m height (above that is high-rise and is not computed). If built-up area is blank it is estimated as plot area × 1.25.
- **Floors:** the rules fix FAR (Rule 61) but not a floor count; the Development Plan decides (Rule 103). The tool reports max floor area, not a number of floors.
- **"Not found"** relies on the model following the instruction to answer `NOT_FOUND`; retrieval scores cannot separate out-of-scope questions, so check any surprising answer against the cited rule text.
- Retrieval is TF-IDF: for the 17 sample questions the relevant rule is in the top 5 for all except Q11 (covered by the amendment note in the prompt). Unusual wording can miss.
- Running the tests: `pytest tests/test_calculator.py tests/test_retriever.py` needs no key; `tests/test_answerer.py` calls the model and needs `CEREBRAS_API_KEY`.
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
| Frontend | React 19 + Vite 8 (`frontend/`) |
| Auth + amendments | Firebase Authentication + Cloud Firestore |
| Hosting | AWS EC2 (Ubuntu 24.04), nginx, systemd, Let's Encrypt |
| Data | `data/bhumi_vikas_rules.jsonl` — 106 rules, one per line |

---

## API endpoints

| Endpoint | Method | Description |
|---|---|---|
| `POST /api/ask` | POST | `{question, top_k, amendments?}` → answer with rule numbers and source text |
| `POST /api/calculate` | POST | `{plot_area, road_width, building_height, building_type, built_up_area?}` → setbacks and fees |
| `GET /api/rules` | GET | Lists all rule numbers and titles |

---

## License

MIT — see `LICENSE`. Offered to the Government of Madhya Pradesh through MPSeDC.
