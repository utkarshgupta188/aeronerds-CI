# Bhumi Vikas Sahayak · भूमि विकास सहायक

**Track 1 — Claude Impact Lab × Cerebras Café Compute, Bhopal · 11 October 2026**

Ask the MP Bhumi Vikas Rules 2012 in plain English or Hindi. Get the answer with the rule number and the exact text it came from.

**Team:** AeroNerds

**Members:**
- Udit Jadhav (Team Leader)
- Utkarsh Gupta
- Sujay Ghosh
- Raunak Ray
- Abhirag Mishra

**UI:** the React app in `frontend/` (assistant, calculator, document upload, latest updates, clerk login, amendment manager). The FastAPI backend serves only `/api/*`.

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

### Document Upload (दस्तावेज़ अपलोड)
Upload a PDF or TXT file (gazette notification, new draft rule, site report) directly from the Rules Assistant panel. The uploaded document is chunked (400 chars, 50-char overlap) and searched via TF-IDF alongside the base JSONL rules whenever the clerk asks a question. The LLM receives both the retrieved base-rule chunks and the top-3 uploaded-doc chunks in the same prompt and attributes them separately in the answer. Uploaded docs are shown as chips with filename, size, and chunk count; each chip has an × to remove it. Documents are session-scoped (in-memory on the backend; a server restart clears them — by design, no persistent storage of uploaded content).

### Clerk login and Amendments (संशोधन)
Clerks sign in with Firebase Authentication (email/password). In the Manage Amendments tab, which exists only after sign-in, they pick a rule from the list, then record the effective date, title and text. Each amendment has an on/off switch. Amendments are stored in Firestore and sync live. Active amendments are sent with every question and the model is told they take precedence over the base rules. Citizens see them read-only in a Latest Updates tab that appears only when at least one amendment is active. Only signed-in clerks can write (Firestore security rules).

---

## Evaluation

Run `python eval.py` to send the 17 sample questions to the model (needs `CEREBRAS_API_KEY`). Q1–Q15 cite a rule; Q16–Q17 are out of scope and return "Not found".

```bash
pytest tests/test_calculator.py tests/test_retriever.py   # no API key needed
pytest tests/test_answerer.py                              # needs CEREBRAS_API_KEY
python eval.py                                             # 17 sample questions end-to-end
```

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
| `POST /api/ask` | POST | `{question, top_k, amendments?, doc_ids?}` → answer with rule numbers and source text |
| `POST /api/calculate` | POST | `{plot_area, road_width, building_height, building_type, built_up_area?}` → setbacks and fees |
| `GET /api/rules` | GET | Lists all rule numbers and titles |
| `POST /api/upload` | POST | Upload a PDF or TXT document; returns `{doc_id, name, chunks, size_kb}` |
| `GET /api/uploads` | GET | Lists all uploaded documents for this server session |
| `DELETE /api/uploads/{doc_id}` | DELETE | Removes an uploaded document |

---

## License

MIT — see `LICENSE`. Offered to the Government of Madhya Pradesh through MPSeDC.
