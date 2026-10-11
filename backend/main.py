import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


class CalcRequest(BaseModel):
    plot_area: float          # sq m
    road_width: float         # m
    building_height: float    # m
    building_type: str = "residential"  # residential | commercial | farm_house


@app.post("/api/ask")
def ask(req: AskRequest):
    rules, vec = get_index()
    chunks = search(req.question, rules, vec, top_k=req.top_k)
    result = llm_answer(req.question, chunks)
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
    elif plot_area <= 200:
        return {"value": 1.5, "rule": "56(2)(a)", "label": "40–200 sq m plot"}
    elif plot_area <= 500:
        return {"value": 2.0, "rule": "56(2)(a)", "label": "200–500 sq m plot"}
    else:
        return {"value": 3.0, "rule": "56(2)(a)", "label": ">500 sq m plot"}


def _permission_fee(plot_area: float, building_type: str) -> dict:
    """Rule 21(b) — permission fee for residential use (approximate from table)."""
    if building_type == "farm_house":
        return {"value": None, "rule": "21", "label": "See Rule 21 Schedule for farm house fees"}
    # Residential fee per Rule 21(b) Item 1 (approximate)
    if plot_area <= 75:
        fee = 1500
    elif plot_area <= 200:
        fee = 3000
    elif plot_area <= 500:
        fee = 6000
    else:
        fee = 10000
    return {"value": fee, "rule": "21(b)", "label": f"Residential, {plot_area:.0f} sq m"}


@app.post("/api/calculate")
def calculate(req: CalcRequest):
    front = _front_setback(req.road_width)
    rear = _rear_setback(req.plot_area)
    fee = _permission_fee(req.plot_area, req.building_type)

    side_note = "Rule 56(3): side open space depends on frontage and building height — see table in Rule 56."

    return {
        "front_setback": front,
        "rear_setback": rear,
        "permission_fee": fee,
        "side_note": side_note,
        "data_note": "Consolidated to 6 March 2025. Verify table values against the official PDF.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
