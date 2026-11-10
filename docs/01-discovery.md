# 01 — Discovery

**Question this phase answers:** is this problem real, painful, and worth solving now?

Discovery is not market research theater. It is the cheapest place to kill a bad idea. A one-page brief with honest evidence beats six months of polished code for a problem nobody has.

**Gate G1:** the discovery note is signed off and the riskiest assumption has a test.

---

## Inputs

- `project/00-brief.md` (approved at G0)
- Access to at least 3 potential users, or existing support tickets/analytics
- Any constraints from the human: budget, deadline, compliance, existing stack

## Output

`project/01-discovery.md`, using `.agents/templates/discovery.md`.

It must contain:

1. Problem statement in one sentence.
2. Who has the problem, and how they solve it today.
3. Evidence (interviews, tickets, data, prior art) with sources.
4. Riskiest assumptions, ranked.
5. Smallest experiment that could falsify each assumption.
6. Constraints and non-goals.
7. Recommendation: proceed, pivot, or stop.

---

## Procedure

### 1. Write the problem as a sentence

> `<who>` struggles with `<problem>` when `<situation>`, which costs `<time/money/risk>`.

Bad: "We need an AI dashboard."
Good: "Support leads cannot see which tickets are about to breach SLA, so they triage by gut feel and miss about 8% of deadlines."

If you cannot name the who, the when, and the cost, you are not ready to research.

### 2. List current alternatives

For each user segment, write down what they do today: spreadsheet, competitor, manual process, nothing. "Nothing" is a real competitor. Your product must be meaningfully better than the workaround, not just better than a blank page.

### 3. Gather evidence, cheapest first

| Source | Cost | Signal |
|---|---|---|
| Existing analytics / logs | low | behavior, drop-off |
| Support tickets / sales calls | low | language, frequency |
| 3–5 user interviews | medium | motivation, workaround |
| Prototype test | medium | comprehension, willingness |
| Landing page / waitlist | medium | demand |
| Paid pilot | high | willingness to pay |

Record direct quotes. Separate **observation** ("they export to Excel daily") from **interpretation** ("they hate our UI"). Interpretations are hypotheses, not evidence.

### 4. Rank assumptions

Use this format:

| # | Assumption | Confidence | Impact if wrong | Test | Owner |
|---|---|---|---|---|---|
| A1 | Users will switch from spreadsheets | low | fatal | 5 interviews + prototype | human |
| A2 | Data can be fetched in <5 min | medium | high | spike | agent |

The riskiest assumption is the one with **low confidence and fatal impact**. Test that first.

### 5. Define success before building

Pick one primary metric and one guardrail:

- Primary: `% of tickets triaged before SLA breach` (target: 95% → 99%)
- Guardrail: `median triage time` must not increase

A metric without a baseline is a wish. Capture the current number.

### 6. Write the recommendation

End with one of:

- **Proceed** — evidence supports the problem; the next phase is product definition.
- **Pivot** — the problem is real but the segment or solution is wrong; state the new hypothesis.
- **Stop** — the problem is not painful enough, or the cost of solving it exceeds the value.

Stopping early is a success of the framework, not a failure.

---

## Interview guide (20 minutes)

1. "Walk me through the last time this happened."
2. "What did you do next?"
3. "What was the most frustrating part?"
4. "What have you tried? Why did it not stick?"
5. "If this disappeared tomorrow, what would you do?"
6. "Who else has this problem?"
7. "What would make you switch?"

Do not pitch. Do not ask "would you use this?" Ask about past behavior. Past behavior is evidence; future intent is politeness.

---

## Anti-patterns

| Anti-pattern | Why it hurts | Fix |
|---|---|---|
| Surveying 100 people before talking to 5 | wide but shallow | 5 deep interviews first |
| Asking "would you pay for this?" | hypothetical | ask what they pay for today |
| Treating a competitor as proof of demand | they may be failing too | find the workaround users actually keep |
| Skipping the baseline metric | cannot prove impact | measure before building |
| Discovery as a one-time event | assumptions change | re-open when evidence contradicts |

---

## Exit checklist

- [ ] Problem sentence names who, when, and cost.
- [ ] At least 3 evidence sources, with links or quotes.
- [ ] Current alternatives documented.
- [ ] Top 3 assumptions ranked by risk.
- [ ] One cheap test per fatal assumption.
- [ ] Primary metric + baseline + guardrail.
- [ ] Explicit recommendation.
- [ ] Human approves G1 in `project/STATE.md`.

Next: [02-product-definition.md](02-product-definition.md).
