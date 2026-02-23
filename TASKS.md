# TASK INBOX

## Active Task: Workspace Path Audit
**Assigned:** 2026-02-17  
**Priority:** HIGH

We changed main workspace from `/home/node/openclaw` to `/home/node/.openclaw/workspace`. This broke paths in HEARTBEAT.md.

**Your mission:**
1. Audit your own workspace (`/home/node/.openclaw/workspace-ellis/`) for broken paths
2. Search for hardcoded references to `/home/node/openclaw` or relative `scripts/` paths
3. Verify these scripts still work:
   - /home/node/openclaw/scripts/virgil-email-check.js
   - /home/node/openclaw/scripts/mmr-check.js
   - /home/node/openclaw/scripts/google-auth.js
   - /home/node/openclaw/scripts/payroll-orchestrator.js
   - /home/node/openclaw/scripts/daily-service-*.js
4. Check if any config files need path updates

**Report on your next heartbeat:** What files need fixes, what paths are broken.