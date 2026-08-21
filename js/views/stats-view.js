/**
 * Speedway Scorecard - Match Analytics & Insights View
 * Visualizes Gate Bias statistics (Gate 1-4 win percentages),
 * match momentum timeline, heat margins breakdown, and MVP rider.
 */

export class StatsView {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('view-stats');
  }

  render() {
    if (!this.container) return;
    const match = this.app.currentMatch;
    if (!match) {
      this.container.innerHTML = `<div class="p-4 text-center text-muted">No active match found.</div>`;
      return;
    }

    const gateStats = match.gateStats || {
      1: { wins: 0, points: 0, rides: 0 },
      2: { wins: 0, points: 0, rides: 0 },
      3: { wins: 0, points: 0, rides: 0 },
      4: { wins: 0, points: 0, rides: 0 },
    };

    // Calculate total completed heats
    const completedHeats = match.heats.filter((h) => h.status === 'completed' || h.homeScore > 0 || h.awayScore > 0);
    const totalCompleted = completedHeats.length || 1;

    // Calculate margin breakdown
    let home5_1 = 0;
    let home4_2 = 0;
    let draws3_3 = 0;
    let away2_4 = 0;
    let away1_5 = 0;

    completedHeats.forEach((h) => {
      if (h.homeScore === 5 && h.awayScore === 1) home5_1++;
      else if (h.homeScore === 4 && h.awayScore === 2) home4_2++;
      else if (h.homeScore === 3 && h.awayScore === 3) draws3_3++;
      else if (h.homeScore === 2 && h.awayScore === 4) away2_4++;
      else if (h.homeScore === 1 && h.awayScore === 5) away1_5++;
    });

    // Fastest time
    const timedHeats = completedHeats.filter((h) => h.timeSeconds && h.timeSeconds > 0);
    const fastestHeat = timedHeats.length > 0
      ? timedHeats.reduce((min, h) => (h.timeSeconds < min.timeSeconds ? h : min), timedHeats[0])
      : null;

    this.container.innerHTML = `
      <div class="mb-4">
        <h2 class="text-lg font-black tracking-wide">Match Insights & Stats</h2>
        <p class="text-xs text-muted">Gate bias, momentum, and heat breakdowns</p>
      </div>

      <!-- MVP / Top Scorer Spotlight -->
      ${match.mvpRider ? `
        <div class="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-amber-500 text-black flex items-center justify-center text-xl font-black">
              ⭐
            </div>
            <div>
              <div class="text-[0.68rem] text-amber-400 font-bold uppercase tracking-wider">Top Match Scorer</div>
              <div class="text-base font-black text-white">${match.mvpRider.name}</div>
              <div class="text-xs text-slate-300">
                ${match.mvpRider.rides?.length || 0} rides · CMA: ${match.mvpRider.cma}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-black text-amber-400">${match.mvpRider.totalPoints}${match.mvpRider.totalBonus > 0 ? `+${match.mvpRider.totalBonus}` : ''}</div>
            <div class="text-[0.65rem] text-slate-400 font-bold">Paid Points</div>
          </div>
        </div>
      ` : ''}

      <!-- Quick Metrics Grid -->
      <div class="stats-grid">
        <div class="stat-box">
          <div class="text-xs text-muted font-bold uppercase">Heats Completed</div>
          <div class="stat-val">${completedHeats.length} <span class="text-sm text-muted font-normal">/ 15</span></div>
        </div>
        <div class="stat-box">
          <div class="text-xs text-muted font-bold uppercase">Score Margin</div>
          <div class="stat-val text-blue-400">${match.homeScore - match.awayScore > 0 ? `+${match.homeScore - match.awayScore}` : match.homeScore - match.awayScore}</div>
        </div>
        <div class="stat-box">
          <div class="text-xs text-muted font-bold uppercase">Fastest Heat</div>
          <div class="stat-val text-emerald-400">${fastestHeat ? `${fastestHeat.timeSeconds}s` : 'N/A'}</div>
          ${fastestHeat ? `<div class="text-[0.65rem] text-muted">Heat ${fastestHeat.heatNumber}</div>` : ''}
        </div>
        <div class="stat-box">
          <div class="text-xs text-muted font-bold uppercase">Bonus Points</div>
          <div class="stat-val text-amber-400">${(match.homeRiderStats || []).reduce((acc, r) => acc + r.totalBonus, 0) + (match.awayRiderStats || []).reduce((acc, r) => acc + r.totalBonus, 0)}</div>
        </div>
      </div>

      <!-- GATE BIAS & ADVANTAGE SECTION -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200">Gate Bias & Success Rate</h3>
          <span class="text-xs text-muted">${totalCompleted} heats</span>
        </div>

        <div class="space-y-3">
          ${[1, 2, 3, 4].map((gateNum) => {
            const data = gateStats[gateNum] || { wins: 0, points: 0, rides: 0 };
            const winPct = totalCompleted > 0 ? Math.round((data.wins / totalCompleted) * 100) : 0;
            const avgPts = data.rides > 0 ? (data.points / data.rides).toFixed(1) : '0.0';

            const gateColors = {
              1: { name: 'Gate 1 (Inside)', bg: '#ef4444', text: '#fff' },
              2: { name: 'Gate 2 (Mid-In)', bg: '#3b82f6', text: '#fff' },
              3: { name: 'Gate 3 (Mid-Out)', bg: '#f8fafc', text: '#0f172a' },
              4: { name: 'Gate 4 (Outside)', bg: '#eab308', text: '#000' },
            }[gateNum];

            return `
              <div>
                <div class="flex items-center justify-between text-xs font-bold mb-1">
                  <div class="flex items-center gap-2">
                    <span class="gate-pill-mini" style="background: ${gateColors.bg}; color: ${gateColors.text}">G${gateNum}</span>
                    <span>${gateColors.name}</span>
                  </div>
                  <span>${data.wins} wins (${winPct}%) · Avg ${avgPts} pts</span>
                </div>
                <div class="gate-progress-bg">
                  <div class="gate-progress-fill" style="width: ${winPct}%; background: ${gateColors.bg}"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- HEAT MARGINS BREAKDOWN -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3">Heat Margins Breakdown</h3>
        <div class="grid grid-cols-5 gap-2 text-center">
          <div class="bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl">
            <div class="text-lg font-black text-emerald-400">${home5_1}</div>
            <div class="text-[0.65rem] text-emerald-300 font-bold mt-1">5 - 1</div>
            <div class="text-[0.58rem] text-muted">Home Max</div>
          </div>
          <div class="bg-blue-950/40 border border-blue-800/60 p-2.5 rounded-xl">
            <div class="text-lg font-black text-blue-400">${home4_2}</div>
            <div class="text-[0.65rem] text-blue-300 font-bold mt-1">4 - 2</div>
            <div class="text-[0.58rem] text-muted">Home Win</div>
          </div>
          <div class="bg-slate-800 border border-slate-700 p-2.5 rounded-xl">
            <div class="text-lg font-black text-slate-200">${draws3_3}</div>
            <div class="text-[0.65rem] text-slate-400 font-bold mt-1">3 - 3</div>
            <div class="text-[0.58rem] text-muted">Shared</div>
          </div>
          <div class="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl">
            <div class="text-lg font-black text-amber-400">${away2_4}</div>
            <div class="text-[0.65rem] text-amber-300 font-bold mt-1">2 - 4</div>
            <div class="text-[0.58rem] text-muted">Away Win</div>
          </div>
          <div class="bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl">
            <div class="text-lg font-black text-rose-400">${away1_5}</div>
            <div class="text-[0.65rem] text-rose-300 font-bold mt-1">1 - 5</div>
            <div class="text-[0.58rem] text-muted">Away Max</div>
          </div>
        </div>
      </div>
    `;
  }
}

