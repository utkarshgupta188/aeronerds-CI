import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from src.embedder import embed_rules, search
from src.answerer import answer as llm_answer

app = FastAPI(title="Bhumi Vikas Sahayak API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "bhumi_vikas_rules.jsonl")
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates")


@app.get("/", response_class=HTMLResponse)
def root():
    with open(os.path.join(TEMPLATES_DIR, "index.html"), encoding="utf-8") as f:
        return f.read()

_rules = None
_vec = None

def get_index():
    global _rules, _vec
    if _rules is None:
        _rules, _vec = embed_rules(DATA_PATH)
    return _rules, _vec


class AskRequest(BaseModel):
    question: str
    top_k: int = 5
    amendments: list[str] = []


class CalcRequest(BaseModel):
    plot_area: float                    # sq m
    road_width: float                   # m
    building_height: float              # m
    built_up_area: Optional[float] = None  # sq m; estimated as plot_area*1.25 if omitted
    building_type: str = "residential"  # residential | commercial | farm_house


@app.post("/api/ask")
def ask(req: AskRequest):
    rules, vec = get_index()
    chunks = search(req.question, rules, vec, top_k=req.top_k)
    result = llm_answer(req.question, chunks, amendments=req.amendments)
    return result


@app.get("/api/benchmark")
def benchmark():
    questions = [
        ("1", "My house faces a 10 m wide street and will be 9 m tall. How much open space do I leave at the front?"),
        ("2", "I want a farm house on agricultural land. What is the minimum plot size and the maximum FAR?"),
        ("3", "My development permission was granted in 2023. How long does it stay valid, and how many times can I renew it?"),
        ("4", "I applied for building permission and the authority has not replied. What happens if they miss the deadline?"),
        ("5", "How far must my balcony stay from a low-voltage overhead electric line, vertically and horizontally?"),
        ("6", "Who is allowed to sign and submit my building plans?"),
        ("7", "What documents go with an application for building permission?"),
        ("8", "What is the fee for building permission for a residential house?"),
        ("9", "Can I change my plan after it is sanctioned?"),
        ("10", "What is the minimum rear open space for a 150 sq m residential plot?"),
        ("11", "Do I need separate development permission for a 300 sq m plot that matches the Development Plan?"),
        ("12", "Which rule decides what happens when the Development Plan and these rules disagree?"),
        ("13", "What are the rules for lifts in a building taller than 15 m?"),
        ("14", "मेरा प्लॉट 200 वर्ग मीटर का है और सामने 9 मीटर चौड़ी सड़क है। आगे कितनी जगह खाली छोड़नी होगी?"),
        ("15", "बिल्डिंग परमिशन की फीस कितनी है और किस नियम में लिखी है?"),
        ("16", "How do I pay my property tax online?"),
        ("17", "What is the current market rate for land in Kolar Road, Bhopal?"),
    ]
    rules, vec = get_index()
    results = []
    for num, q in questions:
        chunks = search(q, rules, vec, top_k=5)
        r = llm_answer(q, chunks)
        results.append({
            "id": num,
            "question": q,
            "not_found": r["not_found"],
            "rule_numbers": r["rule_numbers"],
            "answer_text": r["answer_text"][:300],
            "expected_not_found": num in ("16", "17"),
        })
    return {"results": results}


def _front_setback(road_width: float) -> dict:
    """Rule 56(1)(a) — residential buildings up to 12.5m."""
    if road_width <= 9.0:
        return {"value": 3.0, "rule": "56(1)(a)", "label": "≤9m road"}
    elif road_width <= 12.0:
        return {"value": 3.6, "rule": "56(1)(a)", "label": "9–12m road"}
    elif road_width <= 18.0:
        return {"value": 4.5, "rule": "56(1)(a)", "label": "12–18m road"}
    else:
        return {"value": 6.0, "rule": "56(1)(a)", "label": ">18m road"}


def _rear_setback(plot_area: float) -> dict:
    """Rule 56(2)(a) — residential buildings up to 12.5m."""
    if plot_area <= 40:
        return {"value": 0.0, "rule": "56(2)(a)", "label": "≤40 sq m plot"}
    elif plot_area <= 150:
        return {"value": 1.5, "rule": "56(2)(a)", "label": "40–150 sq m plot"}
    elif plot_area <= 225:
        return {"value": 2.5, "rule": "56(2)(a)", "label": "150–225 sq m plot"}
    else:
        return {"value": 3.0, "rule": "56(2)(a)", "label": ">225 sq m plot"}


def _permission_fee(built_up_area: float, building_type: str) -> dict:
    """Rule 21(3)(b) Table Item 1 — permission fee based on built-up area slabs."""
    if building_type == "farm_house":
        return {"value": None, "rule": "21", "label": "See Rule 21 schedule for farm house fees"}
    multiplier = 1.5 if building_type == "commercial" else 1.0
    # Rule 21(3)(b) Item 1 slabs (residential); commercial adds 50%
    if built_up_area <= 75:
        base = 750
    elif built_up_area <= 125:
        base = 1250
    elif built_up_area <= 200:
        base = 2000
    elif built_up_area <= 300:
        base = 3000
    elif built_up_area <= 400:
        base = 4000
    elif built_up_area <= 600:
        base = 6000
    elif built_up_area <= 750:
        base = 7500
    elif built_up_area <= 1000:
        base = 10000
    elif built_up_area <= 1250:
        base = 12500
    elif built_up_area <= 1500:
        base = 15000
    elif built_up_area <= 2000:
        base = 20000
    elif built_up_area <= 2500:
        base = 25000
    else:
        base = 50000
    app_fee = round(built_up_area * 1.0)  # Rule 21(2)(ii): ₹1/sq m application fee
    sanction_fee = round(base * multiplier)
    total = app_fee + sanction_fee
    label = f"Built-up {built_up_area:.0f} sq m · App fee ₹{app_fee:,} + Sanction ₹{sanction_fee:,}"
    return {"value": total, "app_fee": app_fee, "sanction_fee": sanction_fee, "rule": "21(2)(ii)+21(3)(b)", "label": label}


@app.post("/api/calculate")
def calculate(req: CalcRequest):
    front = _front_setback(req.road_width)
    rear = _rear_setback(req.plot_area)
    # Estimate built-up area as plot_area × FAR 1.25 (residential default) if not provided
    bua = req.built_up_area if req.built_up_area and req.built_up_area > 0 else req.plot_area * 1.25
    fee = _permission_fee(bua, req.building_type)

    lift_required = req.building_height > 12.5
    lift_note = (
        "Lift mandatory — Rule 83 (height > 12.5 m, NBC Part-VIII applies)"
        if lift_required else
        "Lift not required — Rule 83 (height ≤ 12.5 m)"
    )

    dev_permission = (
        "No separate T&CP development permission needed — Aug 2026 amendment to Rule 2(5)(c) exempts plots ≤ 500 sq m"
        if req.plot_area <= 500 else
        "T&CP development permission required before building sanction (Rule 12, plot > 500 sq m)"
    )

    if req.building_type == "residential":
        max_floor_area = round(req.plot_area * 1.25, 1)
        far_note = (
            f"FAR 1.25 (Rule 61, Table 8) → max total floor area {max_floor_area:g} sq m on this plot. "
            "Number of floors is not fixed by these rules: it follows from ground coverage and height set in the "
            "Development Plan (Rule 103); up to 12.5 m height needs no lift (Rule 83)."
        )
    elif req.building_type == "farm_house":
        far_note = (
            "Farm house (Rule 17): min plot 0.40 ha, max FAR 0.10, max height 7.5 m, "
            "7.5 m open space on all sides."
        )
        max_floor_area = round(req.plot_area * 0.10, 1)
    else:
        max_floor_area = None
        far_note = (
            "Commercial FAR depends on the centre category in Rule 61, Table 8 "
            "(1.25 to 2.50); check the Development Plan (Rule 103). Height above 12.5 m: Rule 42, Table 4."
        )

    side_note = "Rule 56(3): detached building — 3 m both sides; semi-detached — 3 m one side; row-type — nil."

    return {
        "front_setback": front,
        "rear_setback": rear,
        "permission_fee": fee,
        "lift_note": lift_note,
        "dev_permission": dev_permission,
        "far_note": far_note,
        "max_floor_area": max_floor_area,
        "side_note": side_note,
        "data_note": "Consolidated to 6 March 2025. Verify against the official gazette.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
