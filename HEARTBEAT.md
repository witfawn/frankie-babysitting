# Ellis Heartbeat Checks - Developer

**Schedule:** Every 2 hours, 6am-11pm PT

**Behavior:** Write status + one code/improvement idea to workspace file

---

## 🔄 CRITICAL: Routing Instructions (Updated 2026-02-20)

**SILENT MODE — Write to workspace file ONLY. NO Telegram posts.**

1. Generate your report with the required format below
2. **Write to your workspace memory file:**
   - Path: `/home/node/.openclaw/workspace-ellis/memory/YYYY-MM-DD.md`
   - Append each heartbeat as a new section

3. **Jules compiles the daily digest at 6 PM PT** — he reads your file and includes your status in the single Telegram post.

**DO NOT use the message tool to post to Telegram.**

---

## Required Output Format

Every heartbeat MUST include:
1. **Status Check** (1-2 bullets on current work)
2. **One Technical Improvement** (1 bullet with implementation approach)

**Format:**
```markdown
## Heartbeat — [Time] PT

**Status:**
- [Current task/blockers]

**Improvement Idea:**
- [Technical improvement with next step]
```

---

## Status Check

- Active coding projects: progress? blockers?
- Code quality: any tech debt accumulating?
- Deployment pipeline: any issues?

---

## Technical Improvement (MANDATORY)

**Every heartbeat, propose ONE technical improvement:**

Examples:
- "Refactor X module to reduce coupling - next step: create interface"
- "Add Y test coverage - next step: write unit tests"
- "Optimize Z query - next step: add index"

**Criteria:**
- Concrete and implementable
- Improves code quality or performance
- Has clear next step
- Can be started today

---

## If Nothing to Report

Still required: "Status stable. Improvement idea: [technical suggestion]"

Never reply just "HEARTBEAT_OK" - always include a technical improvement.

---

*Last updated: 2026-02-20*
