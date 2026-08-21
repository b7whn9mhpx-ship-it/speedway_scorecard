/**
 * Speedway Scorecard - Official Program Matrix Grid View
 * Renders the traditional speedway program table with Riders 1-7,
 * Heats 1-15 columns, Bonus points, Paid totals, and running aggregates.
 */

export class ScorecardView {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('view-scorecard');
  }

  render() {
    if (!this.container) return;
    const match = this.app.currentMatch;
    if (!match) {
      this.container.innerHTML = `<div class="p-4 text-center text-muted">No active match found.</div>`;
      return;
    }

    this.container.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-lg font-black tracking-wide">Program Scorecard</h2>
          <p class="text-xs text-muted">Tap any heat column or rider to edit</p>
        </div>
        <div class="flex gap-2 no-print">
          <button class="tool-btn" id="btn-print-scorecard" title="Print Program">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
            Print
          </button>
          <button class="tool-btn" id="btn-share-scorecard" title="Share Match">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Share
          </button>
        </div>
      </div>

      <!-- Main Scorecard Table Container -->
      <div class="scorecard-container">
        <div class="table-wrapper">
          <table class="program-table">
            <thead>
              <tr>
                <th class="sticky-col">Rider</th>
                ${Array.from({ length: 15 }, (_, i) => `<th class="heat-col-head cursor-pointer" data-heat="${i + 1}">Ht ${i + 1}</th>`).join('')}
                <th>Rds</th>
                <th>Pts</th>
                <th>B</th>
                <th>Paid</th>
                <th>CMA</th>
              </tr>
            </thead>
            <tbody>
              <!-- HOME TEAM SECTION -->
              <tr>
                <td colspan="21" class="team-section-header home">
                  🔵 ${match.homeTeamName.toUpperCase()} (${match.homeScore} PTS)
                </td>
              </tr>
              ${(match.homeRoster || []).map((rider) => this.renderRiderRow(rider, match, 'home')).join('')}

              <!-- Running Heat Summary for Home -->
              <tr class="running-score-row">
                <td class="sticky-col font-bold">Home Score</td>
                ${match.heats.map((h) => `<td class="font-bold text-blue-400">${h.homeScore}</td>`).join('')}
                <td colspan="5" class="total-cell text-blue-400 font-black">${match.homeScore}</td>
              </tr>

              <!-- AWAY TEAM SECTION -->
              <tr>
                <td colspan="21" class="team-section-header away">
                  🟡 ${match.awayTeamName.toUpperCase()} (${match.awayScore} PTS)
                </td>
              </tr>
              ${(match.awayRoster || []).map((rider) => this.renderRiderRow(rider, match, 'away')).join('')}

              <!-- Running Heat Summary for Away -->
              <tr class="running-score-row">
                <td class="sticky-col font-bold">Away Score</td>
                ${match.heats.map((h) => `<td class="font-bold text-yellow-400">${h.awayScore}</td>`).join('')}
                <td colspan="5" class="total-cell text-yellow-400 font-black">${match.awayScore}</td>
              </tr>

              <!-- AGGREGATE RUNNING PROGRESSION -->
              <tr class="bg-slate-950 font-black">
                <td class="sticky-col text-amber-400">Match Total</td>
                ${match.heats.map((h) => {
                  const runningText = (h.status === 'completed' || h.runningHomeScore > 0 || h.runningAwayScore > 0)
                    ? `${h.runningHomeScore}-${h.runningAwayScore}`
                    : '-';
                  return `<td class="text-xs font-bold text-slate-300">${runningText}</td>`;
                }).join('')}
                <td colspan="5" class="text-amber-400 text-sm">${match.homeScore} - ${match.awayScore}</td>
              </tr>

              <!-- Heat Winning Times Row -->
              <tr class="text-xs text-muted">
                <td class="sticky-col">Time (s)</td>
                ${match.heats.map((h) => `<td>${h.timeSeconds ? `${h.timeSeconds}s` : '-'}</td>`).join('')}
                <td colspan="5"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Summary Cards for iPhone Portrait Screen -->
      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="bg-slate-900 border border-blue-900/60 p-3 rounded-xl">
          <div class="text-xs text-blue-400 font-bold uppercase mb-1">${match.homeTeamName}</div>
          <div class="text-2xl font-black text-blue-400">${match.homeScore} <span class="text-xs text-muted font-normal">pts</span></div>
          <div class="text-xs text-muted mt-2">
            Top: <strong>${this.getTopScorerText(match.homeRiderStats)}</strong>
          </div>
        </div>

        <div class="bg-slate-900 border border-yellow-900/60 p-3 rounded-xl">
          <div class="text-xs text-yellow-400 font-bold uppercase mb-1">${match.awayTeamName}</div>
          <div class="text-2xl font-black text-yellow-400">${match.awayScore} <span class="text-xs text-muted font-normal">pts</span></div>
          <div class="text-xs text-muted mt-2">
            Top: <strong>${this.getTopScorerText(match.awayRiderStats)}</strong>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderRiderRow(rider, match, teamKey) {
    const statsList = teamKey === 'home' ? match.homeRiderStats : match.awayRiderStats;
    const stat = (statsList || []).find((s) => s.number === rider.number) || {
      rideCount: 0,
      totalPoints: 0,
      totalBonus: 0,
      paidPoints: 0,
      cma: '0.00',
    };

    const cells = match.heats.map((heat) => {
      // Find if this rider rode in this heat
      const entry = heat.riders.find((r) => r.team === teamKey && r.riderNumber === rider.number);
      if (!entry) {
        return `<td class="text-slate-700 bg-slate-950/30 cursor-pointer cell-heat-jump" data-heat="${heat.heatNumber}">·</td>`;
      }

      let cellContent = '';
      let cellClass = 'cell-score';

      if (entry.exclusionCode) {
        cellContent = entry.exclusionCode;
        cellClass = 'cell-ex';
      } else if (entry.position === 1) {
        cellContent = '3';
        cellClass = 'text-emerald-400 font-black';
      } else if (entry.position === 2) {
        cellContent = entry.bonus > 0 ? '2*' : '2';
        cellClass = entry.bonus > 0 ? 'cell-bonus' : 'text-blue-400 font-bold';
      } else if (entry.position === 3) {
        cellContent = entry.bonus > 0 ? '1*' : '1';
        cellClass = entry.bonus > 0 ? 'cell-bonus' : 'text-slate-200 font-bold';
      } else if (entry.position === 4) {
        cellContent = '0';
        cellClass = 'text-slate-500 font-medium';
      } else if (entry.position !== null) {
        cellContent = `${entry.points}`;
      } else {
        // Scheduled to ride but not yet completed
        cellContent = `<span class="text-xs text-slate-500">G${entry.gate}</span>`;
      }

      if (entry.isSubstitute) {
        cellContent = `${cellContent}<span class="text-[0.6rem] block text-green-400 font-normal">sub</span>`;
      }

      return `
        <td class="cursor-pointer cell-heat-jump ${cellClass}" data-heat="${heat.heatNumber}">
          ${cellContent}
        </td>
      `;
    }).join('');

    return `
      <tr>
        <td class="sticky-col">
          <div class="flex items-center gap-1.5">
            <span class="text-muted text-xs font-bold w-4">${rider.number}.</span>
            <span class="truncate">${rider.name}</span>
            ${rider.isRisingStar ? '<span class="text-[0.6rem] text-amber-400 font-bold">(RS)</span>' : (rider.isReserve ? '<span class="text-[0.6rem] text-muted font-bold">(R)</span>' : '')}
          </div>
        </td>
        ${cells}
        <td class="font-bold text-muted">${stat.rideCount}</td>
        <td class="font-black text-slate-100">${stat.totalPoints}</td>
        <td class="font-bold text-amber-400">${stat.totalBonus || '-'}</td>
        <td class="font-black text-emerald-400">${stat.paidPoints}</td>
        <td class="text-xs text-muted">${stat.cma}</td>
      </tr>
    `;
  }

  getTopScorerText(stats) {
    if (!stats || stats.length === 0) return 'None';
    const sorted = [...stats].sort((a, b) => b.totalPoints - a.totalPoints || b.paidPoints - a.paidPoints);
    const top = sorted[0];
    if (!top || top.totalPoints === 0) return 'None';
    const bonus = top.totalBonus > 0 ? `+${top.totalBonus}` : '';
    return `${top.name} (${top.totalPoints}${bonus})`;
  }

  bindEvents() {
    // Jump to heat when clicking heat headers or cells
    this.container.querySelectorAll('.cell-heat-jump, .heat-col-head').forEach((el) => {
      el.addEventListener('click', () => {
        const heatNum = parseInt(el.getAttribute('data-heat'), 10);
        if (heatNum) {
          this.app.playHapticFeedback();
          this.app.heatView.setCurrentHeat(heatNum);
          this.app.setActiveTab('heats');
        }
      });
    });

    // Print Scorecard
    const printBtn = this.container.querySelector('#btn-print-scorecard');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    // Share Scorecard
    const shareBtn = this.container.querySelector('#btn-share-scorecard');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const res = await this.app.shareMatch();
        if (res?.method === 'clipboard') {
          this.app.showToast('Scorecard copied to clipboard! 📋');
        }
      });
    }
  }
}

