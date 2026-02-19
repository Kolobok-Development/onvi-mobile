# OTP Attack Defense – Log Analysis (Onvi-mobile)

**Source:** Better Stack • **Log source:** Onvi-mobile HTTP (ID 1156254)  
**Period:** Last 7 days (query date: 2026-02-16)

---

## 1. Summary: How defense is performing

| Metric | Count |
|--------|--------|
| OTP requests started | 12 |
| OTP sent successfully | 7 |
| Blocked (rate limit) | 3 (2 phone, 1 IP) |
| Skipped (attack mode – unknown phone) | 2 |
| **Block rate** | **3/12 ≈ 25%** (rate limits working) |
| **Attack-mode blocks** | 2 (unknown phones not sent OTP) |

Defense is active and effective: rate limits and “attack mode” (no OTP to unknown phones) are both triggering.

---

## 2. OTP flow events (last 7 days)

| Event | Reason | Outcome | Count |
|-------|--------|---------|--------|
| `request_started` | — | — | 12 |
| `completed` | — | sent | 7 |
| `skipped` | attack_mode_unknown_phone | not_sent | 2 |
| `blocked` | phone_rate_limit | not_sent | 2 |
| `blocked` | ip_rate_limit | not_sent | 1 |

- **request_started:** Every OTP request is logged at entry.
- **completed (sent):** OTP passed all checks and SMS was sent.
- **skipped (attack_mode_unknown_phone):** “SMS attack mode” is on; OTP is only sent to known users. Two requests for unknown phones were correctly not sent.
- **blocked (phone_rate_limit):** Per-phone limits (60s / 15m / 24h) blocked 2 requests.
- **blocked (ip_rate_limit):** Per-IP limit (10 min window) blocked 1 request.

No `cooldown_redis`, `cooldown_db`, `concurrent_request`, or `global_rate_limit` in this window.

---

## 3. By day (last 7 days)

All 12 requests and all defense events occurred on **2026-02-16**. No OTP activity on other days in the window.

---

## 4. By client IP

| Client IP | request_started | completed | blocked (reason) |
|-----------|------------------|-----------|-------------------|
| 185.16.31.36 | 6 | 3 | phone_rate_limit (2), ip_rate_limit (1) |
| 176.59.170.26 | 2 | 0 | — (2 skipped: attack_mode_unknown_phone) |
| 92.244.246.86 | 2 | 2 | — |
| 46.164.223.63 | 1 | 1 | — |
| 178.210.53.27 | 1 | 1 | — |

- **185.16.31.36** is the only IP that hit rate limits (phone + IP). Defense correctly limited this client.
- **176.59.170.26** had 2 requests for unknown phones; both were skipped in attack mode (no OTP sent).

---

## 5. Defense layers in code (reference)

From `onvi-mobile`:

1. **Per-phone lock** – prevents concurrent OTP send for same number.
2. **Redis cooldown** – no new OTP within configured cooldown after send.
3. **DB cooldown** – fallback using last sent time.
4. **Phone rate limits** – 60s, 15m, 24h windows (env-driven limits).
5. **IP rate limit** – 10 min window (env-driven).
6. **Global rate limit** – OTP requests per minute across all clients.
7. **SMS attack mode** – when enabled, OTP only for phones that already exist in the system; unknown numbers get no SMS (logged as `attack_mode_unknown_phone`).
8. **Throttler** – auth/OTP endpoints have per-minute request limits (e.g. 5 OTP per 5 min).
9. **Login (OTP verify)** – invalid OTP raises `InvalidOtpException` (422); no separate “brute force” counter in these logs; throttler limits attempts.

---

## 6. Recommendations

1. **Keep current logging** – `context: 'OTP_FLOW'` with `event` / `reason` / `outcome` is ideal for this analysis.
2. **Optional: log login failures** – Consider a structured log (e.g. `context: 'OTP_VERIFY'`, `event: 'invalid_otp'`) for 422 on `/auth/login` to measure brute-force attempts over time.
3. **Monitor 185.16.31.36** – Only IP that hit limits; if it recurs, consider blocking or alerting.
4. **Review env limits** – Ensure `RL_PHONE_*`, `RL_IP_*`, `RL_GLOBAL_*`, and OTP cooldown match your risk tolerance.

---

## 7. How to re-run this analysis in Better Stack

Use **Explore** on source **Onvi-mobile HTTP** with queries like:

**Count by event/reason/outcome (OTP flow):**
```sql
SELECT
  JSONExtract(raw, 'event', 'Nullable(String)') AS event,
  JSONExtract(raw, 'reason', 'Nullable(String)') AS reason,
  JSONExtract(raw, 'outcome', 'Nullable(String)') AS outcome,
  count(*) AS cnt
FROM remote(t71636_onvi_mobile_http_logs)
WHERE dt >= now() - INTERVAL 7 DAY
  AND JSONExtract(raw, 'context', 'Nullable(String)') = 'OTP_FLOW'
GROUP BY event, reason, outcome
ORDER BY cnt DESC
```

**By IP:**
```sql
SELECT
  JSONExtract(raw, 'client_ip_masked', 'Nullable(String)') AS client_ip,
  JSONExtract(raw, 'event', 'Nullable(String)') AS event,
  JSONExtract(raw, 'reason', 'Nullable(String)') AS reason,
  count(*) AS cnt
FROM remote(t71636_onvi_mobile_http_logs)
WHERE dt >= now() - INTERVAL 7 DAY
  AND JSONExtract(raw, 'context', 'Nullable(String)') = 'OTP_FLOW'
GROUP BY client_ip, event, reason
ORDER BY cnt DESC
```

For data older than ~30 minutes, use `s3Cluster(primary, t71636_onvi_mobile_http_s3, ...)` with `_row_type = 1` and the same filters.
