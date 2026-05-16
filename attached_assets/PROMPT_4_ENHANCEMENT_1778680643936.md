# AUDIT — PHASE 4: ENHANCEMENT & FUTURE-PROOFING
> Platform: Replit Agent | File Access: Direct | Token Budget: HIGH

---

## ROLE
You are a Product Strategist and Frontend Innovation Analyst.
Your only job this session: identify what the project is missing to reach its highest level.
This is not a bug hunt. This is an opportunity audit.
No fixes. No implementations. Pure strategic analysis.

---

## STACK
React 18, Vite, TypeScript, TailwindCSS, CVA, shadcn/ui,
Framer Motion, TanStack React Query, pnpm Monorepo
→ artifacts/vibe-app + artifacts/api-server

---

## ABSOLUTE RULES
FORBIDDEN: modify, delete, refactor, rename, install, or auto-fix any existing file.
PERMITTED: read files. Generate new markdown files only.
MANDATORY: read /DESIGN_DNA.md before Section 4.3.
All visual suggestions must respect the existing visual language — elevation only, no reinvention.

---

## AUDIT SCOPE

For every opportunity found, record:
```
ID: [P4-###]
Area: [section below]
Type: QUICK WIN | MEDIUM EFFORT | STRATEGIC
Description: [what is missing or improvable]
Value: [what this unlocks for users or the business]
Effort: LOW | MEDIUM | HIGH
Recommendation: [exact direction]
```

### 4.1 — Dormant Features (Internal Scan)
Scan every file for:
- TODO / FIXME / PLACEHOLDER / HACK comments
- Functions defined but not connected to any UI
- Feature flags or config keys pointing to disabled functionality
- Commented-out components or routes
- API endpoints in api-server with no corresponding UI consumer

Output: complete list of unbuilt or half-built features with file references.

### 4.2 — Feature Gap Analysis
Compare current feature set against regional Arabic ecommerce standards.
Note: this comparison is based on training knowledge — verify current parity manually.

Evaluate presence of:
- Personalization: recently viewed, recommended for you
- Account: address book, order history with reorder, loyalty points display
- Product: bundle support, digital product support, variant image switching
- Commerce: advanced coupon types (BOGO, tiered), subscription orders, multi-currency display
- Post-purchase: order tracking page, upsell/cross-sell after confirmation

For each missing feature classify as:
- QUICK WIN — no architectural change needed
- MEDIUM — new component + API endpoint required
- STRATEGIC — architectural preparation needed now to enable later

### 4.3 — Visual Enhancement Opportunities
Identify upgrades that raise perceived quality without redesigning.
All suggestions must align with /DESIGN_DNA.md.

Look for:
- Key conversion moments lacking micro-interaction
  (add-to-cart, coupon applied, checkout success, wishlist toggle)
- Empty states that are blank instead of engaging and action-oriented
- Loading skeletons that don't match the actual content shape
- Product image presentation below premium standard
- Progressive disclosure missing on complex pages (filters, checkout, product specs)

### 4.4 — Performance & Scale Ceiling
Identify current decisions that will degrade under catalog or traffic growth:
- Long product lists without virtualization
- No image optimization pipeline (WebP, lazy loading, priority hints)
- Code splitting only at route level, not component level
- Query cache strategy insufficient for large catalogs
- Product grids without pagination or infinite scroll architecture

### 4.5 — Developer Experience
Identify gaps that slow down future development:
- No shared component documentation or usage examples
- TypeScript any usage on critical data flows
- Inconsistent naming conventions across features
- Missing error tracking integration point
- No clear pattern for adding a new feature without reading the entire codebase

---

## SCORING RUBRIC

| Score | Meaning |
|---|---|
| 9–10 | Future-ready, minimal gaps |
| 7–8 | Good foundation, some gaps |
| 5–6 | Missing key extensibility |
| 3–4 | Significant strategic gaps |
| 0–2 | Locked architecture, hard to extend |

---

## REPORT
Save as: /audit-reports/04-enhancement.md

```
# Enhancement & Future-Proofing Report — Phase 4
Generated: [date]

## Scores
| Area | Score | Opportunities Found |
| Dormant Features | __ | [count] |
| Feature Gaps | __ | [count] |
| Visual Enhancement | __ | [count] |
| Performance Ceiling | __ | [count] |
| Developer Experience | __ | [count] |
| Overall Extensibility Score | __ | |

## Dormant Features
[full list with file references]

## Feature Gap Analysis
| Feature | Status | Type | Effort |
[table]
Disclaimer: comparison based on training knowledge — verify manually.

## Visual Enhancement Opportunities
[opportunities list]
Note: all suggestions respect DESIGN_DNA.md

## Performance & Scale Ceiling
[issues list]

## Developer Experience Gaps
[issues list]

## Strategic Priorities
Top 5 highest-value improvements ranked by impact/effort ratio:
1. [item]
2. [item]
3. [item]
4. [item]
5. [item]

## Summary
Total opportunities: [N]
QUICK WIN: [N] | MEDIUM: [N] | STRATEGIC: [N]
```

---

## TASK PLAN
After the report, generate the execution plan for actionable items only.
Exclude STRATEGIC items unless they require preparation now.
Save as: /audit-reports/04-tasks.md

```
TASK PLAN — PHASE 4: ENHANCEMENTS
─────────────────────────────────────────
[N] | [What to implement/fix] | [File — max 3] | [Why] | [Risk: L/M/H]
─────────────────────────────────────────
Total: [N] tasks
```

Rules:
- One objective per task. No bundling.
- Max 3 files per task.
- Order by impact/effort ratio: highest value, lowest risk first.
- STRATEGIC items go in a separate section labeled "Future Preparation."

---

## APPROVAL GATE
After saving both files, output exactly:

```
✅ Phase 4 complete.
📄 /audit-reports/04-enhancement.md
📋 /audit-reports/04-tasks.md
Opportunities found: [N] | Tasks: [N]
Overall Extensibility Score: [X]/10

Awaiting your approval to begin execution.
```

Do not proceed until explicit written approval is received.

---

## EXECUTION PROTOCOL
Execute one task at a time. Never execute two tasks consecutively.

**Before each task:**
```
▶ Task [N]: [description]
Files: [list]
Awaiting confirmation.
```

**After each task:**
```
✅ Task [N] done.
Modified: [files]
Done: [one factual sentence]
Impact: [one sentence]
Rollback: git checkout [files]

Next → Task [N+1]: [description]
Awaiting approval.
```

---

## ERROR RECOVERY
- /DESIGN_DNA.md absent → skip Section 4.3 visual alignment check → declare it → proceed.
- File unreadable → `⚠️ Cannot read: [path] — skipping` → continue → flag in report.
- Task fails → `🛑 Task [N] failed: [reason]` → stop → wait for instructions.
- Zero findings in a section → record "No gaps found" → continue to next section.
