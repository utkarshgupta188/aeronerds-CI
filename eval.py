import sys, os
sys.path.insert(0, ".")
from src.embedder import embed_rules, search
from src.answerer import answer

rules, vec = embed_rules("data/bhumi_vikas_rules.jsonl")

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
    ("14", "मेरा प्लॉट 200 वर्ग मीटर का है और सामने 9 मीटर चौड़ी सड़क है। आगे कितनी जगह خाली छोड़नी होगी?"),
    ("15", "बिल्डिंग परमिशन की फीस कितनी है और किस नियम में लिखी है?"),
    ("16", "How do I pay my property tax online?"),
    ("17", "What is the current market rate for land in Kolar Road, Bhopal?"),
]

answered = 0
not_found_correct = 0
for num, q in questions:
    chunks = search(q, rules, vec, top_k=5)
    r = answer(q, chunks)
    status = "NOT_FOUND" if r["not_found"] else "ANSWERED"
    rules_cited = ",".join(r["rule_numbers"][:3]) if r["rule_numbers"] else "-"
    ans_preview = r["answer_text"][:100].replace("\n", " ")
    print(f"Q{num}: {status} rules=[{rules_cited}] {ans_preview}")
    if not r["not_found"] and num not in ("16", "17"):
        answered += 1
    if r["not_found"] and num in ("16", "17"):
        not_found_correct += 1

print(f"\nAnswered (Q1-15): {answered}/15")
print(f"Correctly said NOT_FOUND (Q16-17): {not_found_correct}/2")
