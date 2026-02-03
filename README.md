<p align="center">
  <img src="public/codinggita-logo.png" alt="CodingGita Logo" width="120" />
</p>

<h1 align="center">🏆 CodingGita Auction</h1>

<p align="center">
  <strong>Official Auction Arena</strong>
</p>

<p align="center">
  <em>A deterministic, real-time student auction platform built for live institutional events.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Framer_Motion-11-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production_Ready-gold?style=for-the-badge" alt="Production Ready" />
  <img src="https://img.shields.io/badge/License-Proprietary-black?style=for-the-badge" alt="Proprietary" />
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Core Capabilities
- ⚡ **Real-time Auction** — Live bidding with instant updates
- 🔒 **Deterministic Queue** — Seeded randomization, same order every time
- 💰 **Budget Tracking** — Live team spending and remaining credits
- 🎵 **Ceremonial Audio** — Context-aware sound cues for sales

</td>
<td width="50%">

### 🛡️ Live Event Safety
- 🔄 **Refresh-safe State** — LocalStorage persistence
- 📡 **Cross-tab Sync** — BroadcastChannel synchronization
- ⏱️ **Timer Precision** — Timestamp-based, drift-resistant
- 🎨 **Authority Design** — Black & gold institutional theme

</td>
</tr>
</table>

---

## 🖼️ Screenshots

<p align="center">
  <em>Main Auction Interface</em>
</p>

> 📸 *Screenshot placeholder — capture the live interface at `/auction`*

<p align="center">
  <em>Landing Ceremony</em>
</p>

> 📸 *Screenshot placeholder — capture the landing page at `/`*

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The auction interface will be available at **http://localhost:8080**

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CodingGita Auction                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Landing   │───▶│   Auction   │───▶│    Admin    │     │
│  │   Ceremony  │    │    Stage    │    │   Portal    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Authoritative State Store               │  │
│  │  • LocalStorage Persistence                          │  │
│  │  • BroadcastChannel Sync                             │  │
│  │  • Seeded PRNG Queue                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 Auction Flow

```mermaid
graph LR
    A[🎬 Start] --> B[📋 Load Queue]
    B --> C[👤 Present Student]
    C --> D[⏱️ Timer Running]
    D --> E{💰 Bid Set?}
    E -->|Yes| F[✅ Confirm Sale]
    E -->|No| G[⏭️ Skip]
    F --> H[🎵 SOLD Audio]
    G --> C
    H --> I{More Students?}
    I -->|Yes| C
    I -->|No| J[🏁 Auction Complete]
```

---

## 🎨 Design System

<table>
<tr>
<td align="center" width="25%">
  <h3>🖤</h3>
  <strong>Deep Black</strong><br/>
  <code>#030308</code><br/>
  <em>Background</em>
</td>
<td align="center" width="25%">
  <h3>🟡</h3>
  <strong>Gold Authority</strong><br/>
  <code>#D4AF37</code><br/>
  <em>Accent</em>
</td>
<td align="center" width="25%">
  <h3>⚪</h3>
  <strong>Pure White</strong><br/>
  <code>#FFFFFF</code><br/>
  <em>Text</em>
</td>
<td align="center" width="25%">
  <h3>🌑</h3>
  <strong>Muted Gray</strong><br/>
  <code>rgba(255,255,255,0.4)</code><br/>
  <em>Secondary</em>
</td>
</tr>
</table>

### Motion Principles

| ❌ Forbidden | ✅ Allowed |
|-------------|-----------|
| Bounce effects | Opacity fades |
| Spring physics | Subtle scale |
| Elastic easing | Height expansion |
| Fast zooms | Blur-to-focus |
| Flashing | Staggered reveals |

---

## 🔊 Audio System

The platform uses **conditional audio routing** for ceremonial announcements:

| Event | Sound | Trigger |
|-------|-------|---------|
| 🎬 **Startup** | KBC Theme | Once on auction load |
| 💰 **Sale ≥15cr** | "Hacker Hai Bhai" | Price ≥ 15 crores |
| 7️⃣ **Sale = 7cr** | "7 Crore" Meme | Exactly 7 crores |
| ✅ **Default Sale** | KBC Theme | All other sales |

> 🔇 Only **one sound per event**. No overlapping. No race conditions.

---

## 👥 Team Structure

Each **Vanguard** team operates with:

```
┌────────────────────────────────────┐
│         VANGUARD TEAM              │
├────────────────────────────────────┤
│  💰 Budget: 100 credits            │
│  📊 Spent: Live tracking           │
│  👥 Squad: Acquired students       │
│  🎨 Color: Team identity           │
└────────────────────────────────────┘
```

---

## 🔐 Access Control

| Route | Access | Protection |
|-------|--------|------------|
| `/` | 🌐 Public | Landing ceremony |
| `/auction` | 🌐 Public | Main auction view |
| `/admin` | 🔒 Protected | Password required |

---

## 📦 Tech Stack

<table>
<tr>
<td align="center" width="20%">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="40" /><br/>
  <strong>React 18</strong>
</td>
<td align="center" width="20%">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="40" /><br/>
  <strong>TypeScript</strong>
</td>
<td align="center" width="20%">
  <img src="https://vitejs.dev/logo.svg" width="40" /><br/>
  <strong>Vite</strong>
</td>
<td align="center" width="20%">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="40" /><br/>
  <strong>Tailwind</strong>
</td>
<td align="center" width="20%">
  <img src="https://www.framer.com/images/favicons/favicon.png" width="40" /><br/>
  <strong>Framer</strong>
</td>
</tr>
</table>

---

## ⚡ Performance

| Metric | Target | Status |
|--------|--------|--------|
| First Contentful Paint | < 1s | ✅ |
| Time to Interactive | < 2s | ✅ |
| Build Time | < 15s | ✅ |
| Bundle Size | < 500KB | ✅ |

---

## 🛡️ Reliability Guarantees

- ✅ **No data loss** on page refresh
- ✅ **No race conditions** in state mutations
- ✅ **No audio overlap** during sales
- ✅ **No accidental resets** without confirmation
- ✅ **No queue drift** across sessions

---

## 📋 Operational Checklist

Before going live:

- [ ] Verify all students are loaded
- [ ] Confirm team budgets are set correctly
- [ ] Test audio playback on venue speakers
- [ ] Check projector display resolution
- [ ] Ensure network stability (or save state locally)

---

## 🤝 Credits

<p align="center">
  <strong>Built with precision for CodingGita</strong>
</p>

<p align="center">
  <em>"Correctness over convenience. Authority over spectacle. Reliability over novelty."</em>
</p>

---

<p align="center">
  <img src="public/codinggita-logo.png" alt="CodingGita" width="60" />
</p>

<p align="center">
  <strong>CodingGita Auction</strong><br/>
  <em>Official Auction Arena</em>
</p>

<p align="center">
  Made with 🖤 and ✨ for live institutional events
</p>
