import sys, os, io, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from src.embedder import embed_rules, search, search_doc_chunks
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
_uploaded_docs: dict[int, dict] = {}
_next_doc_id = 0


def get_index():
    global _rules, _vec
    if _rules is None:
        _rules, _vec = embed_rules(DATA_PATH)
    return _rules, _vec


class Amendment(BaseModel):
    rule_number: str
    title: str = ""
    text: str = ""
    effective_date: Optional[str] = None


class AskRequest(BaseModel):
    question: str
    top_k: int = 5
    amendments: list[Amendment] = []
    doc_ids: list[int] = []


class CalcRequest(BaseModel):
    plot_area: float                    # sq m
    road_width: float                   # m
    building_height: float              # m
    built_up_area: Optional[float] = None  # sq m; estimated as plot_area*1.25 if omitted
    building_type: str = "residential"  # residential | commercial | farm_house


@app.get("/api/rules")
def list_rules():
    rules, _ = get_index()
    return {"rules": [{"rule": str(r["rule"]), "title": r["title"]} for r in rules]}


@app.post("/api/ask")
def ask(req: AskRequest):
    rules, vec = get_index()
    chunks = search(req.question, rules, vec, top_k=req.top_k)

    doc_chunks = []
    for doc_id in req.doc_ids:
        doc = _uploaded_docs.get(doc_id)
        if doc:
            for hit in search_doc_chunks(req.question, doc["chunks"], top_k=3):
                doc_chunks.append({
                    "rule": f"doc:{doc_id}",
                    "title": doc["name"],
                    "text": hit["text"],
                    "source_type": "uploaded_doc",
                })

    result = llm_answer(
        req.question,
        chunks,
        amendments=[a.model_dump() for a in req.amendments],
        doc_chunks=doc_chunks or None,
    )
    return result


@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    global _next_doc_id
    content = await file.read()
    filename = file.filename or "document"
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if ext == "pdf":
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                full_text = "\n".join(p.extract_text() or "" for p in pdf.pages)
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"Could not read PDF: {exc}")
    elif ext == "txt":
        full_text = content.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(status_code=415, detail="Only PDF and TXT files are supported")

    # Chunk with 50-char overlap
    chunk_size, overlap = 400, 50
    raw_chunks, i = [], 0
    while i < len(full_text):
        chunk = full_text[i : i + chunk_size].strip()
        if chunk:
            raw_chunks.append(chunk)
        i += chunk_size - overlap

    doc_id = _next_doc_id
    _next_doc_id += 1
    _uploaded_docs[doc_id] = {
        "id": doc_id,
        "name": filename,
        "chunks": raw_chunks,
        "uploaded_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "size_kb": round(len(content) / 1024, 1),
    }
    return {"doc_id": doc_id, "name": filename, "chunks": len(raw_chunks), "size_kb": round(len(content) / 1024, 1)}


@app.get("/api/uploads")
def list_uploads():
    return {
        "docs": [
            {"id": d["id"], "name": d["name"], "chunks": len(d["chunks"]),
             "size_kb": d["size_kb"], "uploaded_at": d["uploaded_at"]}
            for d in _uploaded_docs.values()
        ]
    }


@app.delete("/api/uploads/{doc_id}")
def delete_upload(doc_id: int):
    if doc_id not in _uploaded_docs:
        raise HTTPException(status_code=404, detail="Document not found")
    del _uploaded_docs[doc_id]
    return {"deleted": doc_id}


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
    residential_low = req.building_type == "residential" and req.building_height <= 12.5
    if residential_low:
        front = _front_setback(req.road_width)
        rear = _rear_setback(req.plot_area)
    elif req.building_type == "residential":
        msg = "Height above 12.5 m: open spaces per Rule 42, Tables 4 and 5 (Rule 56(5)) — not computed here"
        front = {"value": None, "rule": "56(5)", "label": msg}
        rear = {"value": None, "rule": "56(5)", "label": msg}
    elif req.building_type == "farm_house":
        msg = "Farm house: 7.5 m open space from all sides (Rule 17(f))"
        front = {"value": 7.5, "rule": "17(f)", "label": msg}
        rear = {"value": 7.5, "rule": "17(f)", "label": msg}
    else:
        msg = "Rule 56 tables are for residential buildings; other occupancies: see Rule 57 and the Development Plan"
        front = {"value": None, "rule": "57", "label": msg}
        rear = {"value": None, "rule": "57", "label": msg}

    # Estimate built-up area as plot_area × FAR 1.25 (residential default) if not provided
    bua = req.built_up_area if req.built_up_area and req.built_up_area > 0 else req.plot_area * 1.25
    if req.building_height > 30:
        fee = {"value": None, "rule": "21(3)(b)", "label": "High-rise (above 30 m or 10 storeys): Rule 21(3)(b) schedule does not apply — see Rule 21"}
    else:
        fee = _permission_fee(bua, req.building_type)

    instant_approval = (
        "Plot up to 186 sq m, residential, individual owner: instant/deemed approval available — Rule 12-A (forms A-2(2), A-2(3))"
        if req.building_type == "residential" and req.plot_area <= 186 else ""
    )

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
            + (" Plot is below the 0.40 ha (4000 sq m) minimum — farm house not permissible." if req.plot_area < 4000 else "")
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
        "instant_approval": instant_approval,
        "max_floor_area": max_floor_area,
        "side_note": side_note,
        "data_note": "Consolidated to 6 March 2025. Verify against the official gazette.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
