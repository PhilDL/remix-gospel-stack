# Decision: Use Turso instead of LiteFS

## Context

Both Turso and LiteFS offer SQLite-level performance with local-disk reads.  
The key difference lies in **who handles durability, failover, and global operations**.

Historically this stack was using LiteFS, but I personally switched to Turso long time ago and I'm happy with the decision. I cannot fully recommend LiteFS since I am not using it anymore.

---

## 1. Backup & Recovery

- **LiteFS Cloud** (managed backups) was shut down in 2024.
- Using LiteFS now requires building our own offsite backup and restore pipeline.
- **Turso** provides managed backups and **point-in-time recovery** out of the box.

---

## 2. Operational Simplicity

- **LiteFS:** we must run a cluster, manage primaries, handle failover, and recover from data loss.
- **Turso:** fully managed — same local performance without the operational burden.

---

## 3. Global Distribution

- **LiteFS:** single writable primary; scaling to multiple regions is manual.
- **Turso:** global network of edge replicas with sub-100 ms reads, no setup required.

---

## 4. Local-First Resilience

- **Turso:** embedded replicas keep a local `.db` file that serves reads offline and resyncs automatically.
- **LiteFS:** replicas depend on connectivity to the primary; not resilient to network loss.

---

## 5. Access & Tooling

- **Turso:** HTTP/WebSocket protocol, API tokens, and branching for staging or per-tenant databases.
- **LiteFS:** local-only; we’d need to expose and secure our own endpoints.

---

## 6. Total Cost of Ownership

- **LiteFS:** cheaper infra but expensive in engineering time — backups, failover, DR, monitoring.
- **Turso:** slightly higher cost per query but saves significant time, risk, and maintenance.

---

## Summary

| Criteria      | **Turso** | **LiteFS**  |
| ------------- | --------- | ----------- |
| Backups       | Managed   | DIY         |
| Failover      | Built-in  | Manual      |
| Global Reads  | Automatic | Self-hosted |
| Offline Reads | Yes       | No          |
| Branching     | Yes       | No          |
| Ops Overhead  | Minimal   | High        |

---

## Decision

We choose **Turso** because it delivers the same local-disk speed as LiteFS  
while removing all operational, durability, and recovery complexity.  
For a small team, it’s the clear and sustainable choice.
