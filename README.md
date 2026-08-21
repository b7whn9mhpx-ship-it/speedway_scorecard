# 🏁 Speedway Match Scorecard PWA

A high-performance Progressive Web App (PWA) specifically designed for scoring **British Speedway** matches (SGB Premiership, Championship, and National League) on an iPhone screen or mobile device.

Works **100% offline** at speedway stadiums with instant auto-save, official program matrix grid, rider averages (CMA), gate bias statistics, and rapid 1-tap scoring.

---

## 📱 Features

- **Designed for iPhone Viewports**:
  - Full support for Dynamic Island & Notch safe areas (`viewport-fit=cover`, `env(safe-area-inset-*)`).
  - Standalone PWA mode without browser address bars when added to Home Screen.
  - Large, thumb-friendly tap targets and high-contrast stadium floodlight dark theme / daylight light theme.
  - Haptic touch vibration feedback on scoring taps.
  - Swipe gestures to transition smoothly between Heats 1 through 15.

  - **Official 2026 Premiership Team Declarations (Issue 18)**:
    - **Belle Vue Aces** (39.77): Brady Kurtz (9.20), Jason Doyle (8.14), Zach Cook (7.07), Peter Kildemand (5.73), Norick Blodorn (5.35), Tate Zischke (4.28), William Cairns (4.00 - RS).
    - **Sheffield Tigers** (39.21): Jack Holder (8.75), Josh Pickering (7.88), Chris Holder (7.29), Leon Flint (6.34), Anders Rowe (5.65), Jye Etheridge (3.30), Luke Killeen (3.00 - RS).
    - **Ipswich Witches** (37.65): Richard Lawson (7.64), Danny King (7.24), Tobiasz Musielak (6.79), Tom Brennan (6.53), Scott Nicholls (5.92), Kevin Juhl Pedersen (3.53), Jason Edwards (3.78 - RS).
    - **King's Lynn Stars** (38.11): Max Fricke (8.85), Jan Kvech (6.74), Ben Cook (6.70), Chris Harris (6.49), Cooper Rushen (4.97), Jordan Jenkins (4.36), Jody Scott (3.00 - RS).
    - **Leicester Lions** (37.00): Ryan Douglas (8.76), Sam Masters (6.92), Dan Thompson (6.11), Drew Kemp (5.40), Nick Morris (5.06), Kyle Howarth (4.75), Joe Thompson (3.65 - RS).
    - **Northampton** (35.26): Niels-Kristian Iversen (7.21), Jaimon Lidsey (6.58), Kye Thomson (6.07), Adam Ellis (6.07), Nicolai Klindt (5.89), Mitch McDiarmid (3.44), Luke Harrison (3.00 - RS).
  - **Dynamic Roster Loading**: Changing any team instantly updates all 7 rider names, CMAs, and syncs across all 15 heats.
  - **British League Bonus Points (`*`)**: Teammates finishing 1st & 2nd (5-1) award a bonus point to 2nd; teammates finishing 2nd & 3rd award a bonus point to 3rd when beating an opponent. Paid points calculated automatically (`Pts + Bonus`).
  - **Gate Allocations & Helmet Colours**:
    - **Home**: Red (Gate 1 or 2) & Blue (Gate 3 or 4)
    - **Away**: White (Gate 1 or 2) & Yellow (Gate 3 or 4)
    - Automatic gate rotation based on the coin toss.
  - **Tactical Substitutes (TS) & Reserves (TR)**: Real-time alerts when a team is 6+ points down.
  - **Rider Replacement (R/R)**: Facility toggle with replacement rider assignment.
  - **Full Disqualification / Exclusion Codes**: `X` (Referee Excluded), `M` (2-minute warning), `F` (Fell), `FX` (Fell & Excluded), `FN` (Fell & Injured), `R` (Engine Failure / Retired), `T` (Tapes), `NS` (Non-Starter).

- **5 Dedicated Views via iOS Tab Bar**:
  1. **Heats**: Interactive heat scoring card with 1-tap position entry (`1`, `2`, `3`, `4`, `EX`), winning time tracker (seconds), and rider substitutions.
  2. **Scorecard**: Traditional speedway program grid view showing Riders 1–7 vs Heats 1–15, totals, bonus, paid points, and progressive running match aggregates.
  3. **Riders**: Performance breakdown by rider, including CMA / averages, 1sts/2nds/3rds/zeros/exclusions count, and full heat trail (e.g. `3, 2*, 3, 1, 2 = 11+1`).
  4. **Stats**: Gate bias & success rates (Gate 1 vs 2 vs 3 vs 4 win percentages), heat margins breakdown (count of 5-1s, 4-2s, 3-3s), and "Top Match Scorer" spotlight.
  5. **Match Setup & History**: Quick-select presets for all British Premiership and Championship clubs (Belle Vue, Sheffield, Ipswich, Leicester, King's Lynn, Oxford, Birmingham, Poole, Glasgow, Scunthorpe, Redcar, Edinburgh, Berwick, Plymouth, Workington), roster editor, saved match archive, CSV & JSON data export/import, and printable program format.

- **100% Offline & Auto-Saved**:
  - Service Worker caches all assets for offline reliability at the stadium.
  - Every score and edit is instantly saved to local storage with full multi-level **Undo/Redo** support (`Cmd+Z` / Undo button).

---

## 🚀 Quick Start (Running Locally)

To run the scorecard on your computer or host it on your local WiFi network for your iPhone:

```bash
# Start a local HTTP server
python3 -m http.server 8000
```

Then open your browser to:
```
http://localhost:8000
```

To test on your iPhone on the same Wi-Fi network, open Safari and navigate to:
```
http://<YOUR_COMPUTER_IP_ADDRESS>:8000
```

---

## 📲 How to Install as a Standalone iPhone PWA

1. Open Safari on your iPhone and visit the web app URL.
2. Tap the **Share** button at the bottom of Safari (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>).
3. Scroll down and select **"Add to Home Screen"**.
4. Tap **Add** in the top-right corner.
5. Launch **"Speedway Score"** directly from your iOS Home Screen!

---

## 🧪 Testing

Run the automated test suite:

```bash
python3 tests/test-speedway-rules.py
```

