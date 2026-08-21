/**
 * Speedway Scorecard - Rider Performance & Stats View
 * Renders individual rider breakdowns, heat trails (e.g. 3, 2*, 3, 1),
 * averages (CMA), paid points, and win percentages.
 */

export class RidersView {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('view-riders');
    this.selectedTeam = 'all'; // 'all' | 'home' | 'away'
  }

  render() {
    if (!this.container) return;
    const match = this.app.currentMatch;
    if (!match) {
      this.container.innerHTML = `<div class="p-4 text-center text-muted">No active match found.</div>`;
      return;
    }

    const homeStats = match.homeRiderStats || [];
    const awayStats = match.awayRiderStats || [];

    this.container.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-lg font-black tracking-wide">Rider Performance</h2>
          <p class="text-xs text-muted">Averages, bonuses, and heat trails</p>
        </div>
      </div>

      <!-- Team Filter Tabs -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <button class="py-2 rounded-lg text-xs font-black border transition-all btn-rider-team-filter ${this.selectedTeam === 'all' ? 'bg-amber-500 text-black border-amber-500' : 'bg-slate-900 border-slate-800 text-slate-400'}" data-team="all">
          All Riders
        </button>
        <button class="py-2 rounded-lg text-xs font-black border transition-all btn-rider-team-filter ${this.selectedTeam === 'home' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-slate-800 text-slate-400'}" data-team="home">
          ${match.homeTeamName}
        </button>
        <button class="py-2 rounded-lg text-xs font-black border transition-all btn-rider-team-filter ${this.selectedTeam === 'away' ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-slate-900 border-slate-800 text-slate-400'}" data-team="away">
          ${match.awayTeamName}
        </button>
      </div>

      <!-- HOME RIDERS SECTION -->
      ${(this.selectedTeam === 'all' || this.selectedTeam === 'home') ? `
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-3 h-3 rounded-full bg-blue-500"></span>
            <h3 class="text-sm font-bold uppercase tracking-wider text-blue-400">${match.homeTeamName}</h3>
          </div>
          <div class="space-y-3">
            ${homeStats.map((rider) => this.renderRiderCard(rider, match, 'home')).join('')}
          </div>
        </div>
      ` : ''}

      <!-- AWAY RIDERS SECTION -->
      ${(this.selectedTeam === 'all' || this.selectedTeam === 'away') ? `
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
            <h3 class="text-sm font-bold uppercase tracking-wider text-yellow-400">${match.awayTeamName}</h3>
          </div>
          <div class="space-y-3">
            ${awayStats.map((rider) => this.renderRiderCard(rider, match, 'away')).join('')}
          </div>
        </div>
      ` : ''}
    `;

    this.bindEvents();
  }

  renderRiderCard(rider, match, teamKey) {
    const isHome = teamKey === 'home';
    const bonusText = rider.totalBonus > 0 ? `+${rider.totalBonus}` : '';
    const pointsFormatted = `${rider.totalPoints}${bonusText}`;

    return `
      <div class="rider-card">
        <div class="rider-card-header">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center font-black text-sm text-slate-300">
              #${rider.number}
            </div>
            <div>
              <div class="font-bold text-base text-slate-100 flex items-center gap-1.5">
                ${rider.name}
                ${rider.isRisingStar ? `<span class="text-[0.65rem] bg-amber-950 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded font-bold">RS</span>` : (rider.isReserve ? `<span class="text-[0.65rem] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">RES</span>` : '')}
              </div>
              <div class="text-xs text-muted">
                Initial CMA: <strong>${rider.cma}</strong> ${rider.cma5Pct && rider.cma5Pct !== rider.cma ? `<span class="text-[0.68rem] text-slate-400 font-normal">(+5%: ${rider.cma5Pct})</span>` : ''} · ${rider.rideCount} rides
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="rider-card-points">${pointsFormatted}</div>
            <div class="text-[0.68rem] text-muted font-bold">Paid: ${rider.paidPoints} pts</div>
          </div>
        </div>

        <!-- Finishing Record (1st, 2nd, 3rd, 0, Ex) -->
        <div class="grid grid-cols-5 gap-1.5 my-2.5 text-center text-xs">
          <div class="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <div class="text-emerald-400 font-bold">${rider.firsts}</div>
            <div class="text-[0.62rem] text-muted">1st</div>
          </div>
          <div class="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <div class="text-blue-400 font-bold">${rider.seconds}</div>
            <div class="text-[0.62rem] text-muted">2nd</div>
          </div>
          <div class="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <div class="text-amber-400 font-bold">${rider.thirds}</div>
            <div class="text-[0.62rem] text-muted">3rd</div>
          </div>
          <div class="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <div class="text-slate-400 font-bold">${rider.unplaced}</div>
            <div class="text-[0.62rem] text-muted">0</div>
          </div>
          <div class="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <div class="text-red-400 font-bold">${rider.exclusions}</div>
            <div class="text-[0.62rem] text-muted">Ex</div>
          </div>
        </div>

        <!-- Heat Trail -->
        <div class="rides-trail-badge">
          ${rider.rides && rider.rides.length > 0 ? rider.rides.map((r) => {
            let bubbleClass = '';
            if (r.position === 1) bubbleClass = 'first';
            else if (r.position === 2) bubbleClass = 'second';
            else if (r.bonus > 0) bubbleClass = 'bonus';
            else if (r.exclusionCode) bubbleClass = 'ex';

            return `
              <div class="ride-bubble ${bubbleClass} cursor-pointer btn-jump-to-heat" data-heat="${r.heatNumber}">
                Ht ${r.heatNumber}: <strong>${r.display}</strong>
              </div>
            `;
          }).join('') : `<span class="text-xs text-muted italic">No completed rides yet</span>`}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Team filter button clicks
    this.container.querySelectorAll('.btn-rider-team-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedTeam = btn.getAttribute('data-team');
        this.app.playHapticFeedback();
        this.render();
      });
    });

    // Jump to heat from bubble
    this.container.querySelectorAll('.btn-jump-to-heat').forEach((bubble) => {
      bubble.addEventListener('click', () => {
        const heatNum = parseInt(bubble.getAttribute('data-heat'), 10);
        if (heatNum) {
          this.app.playHapticFeedback();
          this.app.heatView.setCurrentHeat(heatNum);
          this.app.setActiveTab('heats');
        }
      });
    });
  }
}

