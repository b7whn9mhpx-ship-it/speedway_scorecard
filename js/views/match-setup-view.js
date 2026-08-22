/**
 * Speedway Scorecard - Match Setup, Roster Editor & Archive View
 * Allows starting new British Speedway matches, selecting presets with automatic
 * roster loading, editing rosters (1-7), managing saved match history, backups, and app settings.
 */

import { BRITISH_TEAMS_PRESET, createNewMatch, createDefaultRoster, getTeamPreset, getRosterForTeam } from '../models/speedway-rules.js';
import { storageService } from '../services/storage.js';

export class MatchSetupView {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById('view-setup');
    this.activeSection = 'match'; // 'match' | 'roster' | 'history' | 'settings'
  }

  render() {
    if (!this.container) return;
    const match = this.app.currentMatch;
    const savedMatches = storageService.getSavedMatchesList();

    this.container.innerHTML = `
      <div class="mb-4">
        <h2 class="text-lg font-black tracking-wide">Match Management</h2>
        <p class="text-xs text-muted">Setup match, edit rosters, history and settings</p>
      </div>

      <!-- Navigation Segment -->
      <div class="grid grid-cols-4 gap-1.5 mb-4 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button class="py-2 rounded-lg text-xs font-bold transition-all btn-sub-tab ${this.activeSection === 'match' ? 'bg-amber-500 text-black shadow' : 'text-slate-400'}" data-section="match">
          Setup
        </button>
        <button class="py-2 rounded-lg text-xs font-bold transition-all btn-sub-tab ${this.activeSection === 'roster' ? 'bg-amber-500 text-black shadow' : 'text-slate-400'}" data-section="roster">
          Rosters
        </button>
        <button class="py-2 rounded-lg text-xs font-bold transition-all btn-sub-tab ${this.activeSection === 'history' ? 'bg-amber-500 text-black shadow' : 'text-slate-400'}" data-section="history">
          History
        </button>
        <button class="py-2 rounded-lg text-xs font-bold transition-all btn-sub-tab ${this.activeSection === 'settings' ? 'bg-amber-500 text-black shadow' : 'text-slate-400'}" data-section="settings">
          Settings
        </button>
      </div>

      <div id="setup-section-content">
        ${this.renderActiveSection(match, savedMatches)}
      </div>
    `;

    this.bindEvents(match);
  }

  renderActiveSection(match, savedMatches) {
    switch (this.activeSection) {
      case 'match':
        return this.renderMatchSetup(match);
      case 'roster':
        return this.renderRosterEditor(match);
      case 'history':
        return this.renderMatchHistory(savedMatches);
      case 'settings':
        return this.renderSettings();
      default:
        return '';
    }
  }

  renderMatchSetup(match) {
    const premTeams = BRITISH_TEAMS_PRESET.filter((t) => t.league === 'SGB Premiership');
    const champTeams = BRITISH_TEAMS_PRESET.filter((t) => t.league === 'SGB Championship');

    const homePreset = getTeamPreset(match?.homeTeamName);
    const awayPreset = getTeamPreset(match?.awayTeamName);

    return `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3">British League Match Details</h3>

        <!-- HOME TEAM SECTION -->
        <div class="bg-slate-800/60 border border-blue-900/50 p-3.5 rounded-xl mb-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <label class="form-label mb-0 text-blue-300">Home Team</label>
            </div>
            <span class="text-[0.65rem] text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
              ${match?.homeRoster?.length || 7} Riders Loaded
            </span>
          </div>

          <!-- Home Team Dropdown -->
          <div class="form-group mb-2">
            <select class="form-select select-team-preset" id="select-home-preset">
              <option value="">-- Choose British Club (Auto-loads Roster) --</option>
              <optgroup label="SGB Premiership">
                ${premTeams.map((t) => `<option value="${t.name}" ${match?.homeTeamName === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
              </optgroup>
              <optgroup label="SGB Championship">
                ${champTeams.map((t) => `<option value="${t.name}" ${match?.homeTeamName === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
              </optgroup>
            </select>
          </div>

          <!-- Quick Home Chips -->
          <div class="team-presets-list">
            ${BRITISH_TEAMS_PRESET.map((t) => `
              <button class="team-preset-chip btn-set-home-preset ${match?.homeTeamName === t.name ? 'bg-blue-600 text-white font-black' : ''}" 
                      data-name="${t.name}" data-track="${t.track}" data-league="${t.league}">
                ${t.name}
              </button>
            `).join('')}
          </div>

          <div class="form-group mt-2 mb-0">
            <input type="text" class="form-input text-sm" id="input-home-team" value="${match?.homeTeamName || 'Belle Vue Aces'}" placeholder="Home Team Name">
          </div>
        </div>

        <!-- AWAY TEAM SECTION -->
        <div class="bg-slate-800/60 border border-yellow-900/50 p-3.5 rounded-xl mb-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <label class="form-label mb-0 text-yellow-300">Away Team</label>
            </div>
            <span class="text-[0.65rem] text-yellow-400 font-bold bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-800/60">
              ${match?.awayRoster?.length || 7} Riders Loaded
            </span>
          </div>

          <!-- Away Team Dropdown -->
          <div class="form-group mb-2">
            <select class="form-select select-team-preset" id="select-away-preset">
              <option value="">-- Choose British Club (Auto-loads Roster) --</option>
              <optgroup label="SGB Premiership">
                ${premTeams.map((t) => `<option value="${t.name}" ${match?.awayTeamName === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
              </optgroup>
              <optgroup label="SGB Championship">
                ${champTeams.map((t) => `<option value="${t.name}" ${match?.awayTeamName === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
              </optgroup>
            </select>
          </div>

          <!-- Quick Away Chips -->
          <div class="team-presets-list">
            ${BRITISH_TEAMS_PRESET.map((t) => `
              <button class="team-preset-chip btn-set-away-preset ${match?.awayTeamName === t.name ? 'bg-yellow-500 text-black font-black' : ''}" 
                      data-name="${t.name}">
                ${t.name}
              </button>
            `).join('')}
          </div>

          <div class="form-group mt-2 mb-0">
            <input type="text" class="form-input text-sm" id="input-away-team" value="${match?.awayTeamName || 'Sheffield Tigers'}" placeholder="Away Team Name">
          </div>
        </div>

        <!-- Venue & Competition Info -->
        <div class="grid grid-cols-2 gap-3">
          <div class="form-group">
            <label class="form-label">Track / Stadium</label>
            <input type="text" class="form-input" id="input-track" value="${match?.track || 'National Speedway Stadium'}">
          </div>
          <div class="form-group">
            <label class="form-label">League / Competition</label>
            <select class="form-select" id="input-league">
              <option value="SGB Premiership" ${match?.league === 'SGB Premiership' ? 'selected' : ''}>SGB Premiership</option>
              <option value="SGB Championship" ${match?.league === 'SGB Championship' ? 'selected' : ''}>SGB Championship</option>
              <option value="National Development League" ${match?.league === 'National Development League' ? 'selected' : ''}>NDL</option>
              <option value="Challenge Match" ${match?.league === 'Challenge Match' ? 'selected' : ''}>Challenge Match</option>
              <option value="Individual Meeting" ${match?.league === 'Individual Meeting' ? 'selected' : ''}>Individual / Trophy</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" class="form-input" id="input-date" value="${match?.date || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Referee</label>
            <input type="text" class="form-input" id="input-referee" placeholder="e.g. C. Turnbull" value="${match?.referee || ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Gates Allocation</label>
          <select class="form-select" id="input-toss-choice1">
            <option value="home" ${(match?.heat1gates === 'home') ? 'selected' : ''}>Heat 1 Home Team Gates 1 & 3</option>
            <option value="away" ${(match?.heat1gates === 'away') ? 'selected' : ''}>Heat 1 Away Team Gates 1 & 3</option>
          </select>
          <select class="form-select" id="input-toss-choice15">
            <option value="home" ${(match?.heat15gates === 'home') ? 'selected' : ''}>Heat 15 Home Team Gates 1 & 3</option>
            <option value="away" ${(match?.heat15gates === 'away') ? 'selected' : ''}>Heat 15 Away Team Gates 1 & 3</option>
          </select>
        </div>

        <div class="flex flex-col gap-2.5 mt-4">
          <button class="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl shadow-lg" id="btn-save-match-info">
            Save Match Details
          </button>
          <button class="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl border border-slate-700" id="btn-start-new-match">
            Start New Match with Selected Teams
          </button>
          <button class="w-full bg-red-900/50 hover:bg-red-900/70 text-red-200 font-bold py-3 rounded-xl border border-red-700/70" id="btn-reset-current-match">
            Reset Current Match Schedule
          </button>
        </div>
      </div>
    `;
  }

  renderRosterEditor(match) {
    const homeRoster = match?.homeRoster || createDefaultRoster('Home', true);
    const awayRoster = match?.awayRoster || createDefaultRoster('Away', false);

    return `
      <div class="mb-3 flex items-center justify-between">
        <span class="text-xs text-muted">Edit rider names, starting CMAs or R/R facility</span>
      </div>

      <!-- HOME TEAM ROSTER -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-blue-400">${match?.homeTeamName || 'Home Team'} Roster</h3>
            <span class="text-xs text-muted">Riders 1-7 (1-5 Main Body, 6-7 Reserves)</span>
          </div>
          <button class="text-xs text-blue-400 hover:underline font-bold btn-reset-team-roster" data-team="home">
            Reset Defaults
          </button>
        </div>

        <div class="space-y-2">
          ${homeRoster.map((r, idx) => `
            <div class="roster-edit-row">
              <span class="roster-num">#${r.number}</span>
              <input type="text" class="form-input flex-1 input-roster-home-name text-sm" data-idx="${idx}" value="${r.name}" placeholder="Rider Name">
              <input type="number" step="0.01" class="form-input w-20 text-center input-roster-home-cma text-sm" data-idx="${idx}" value="${r.cma}" placeholder="CMA">
              <label class="flex items-center gap-1 text-[0.68rem] text-muted font-bold cursor-pointer" title="Rider Replacement facility">
                <input type="checkbox" class="input-roster-home-rr" data-idx="${idx}" ${r.isRiderReplacement ? 'checked' : ''}>
                R/R
              </label>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AWAY TEAM ROSTER -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-yellow-400">${match?.awayTeamName || 'Away Team'} Roster</h3>
            <span class="text-xs text-muted">Riders 1-7 (1-5 Main Body, 6-7 Reserves)</span>
          </div>
          <button class="text-xs text-yellow-400 hover:underline font-bold btn-reset-team-roster" data-team="away">
            Reset Defaults
          </button>
        </div>

        <div class="space-y-2">
          ${awayRoster.map((r, idx) => `
            <div class="roster-edit-row">
              <span class="roster-num">#${r.number}</span>
              <input type="text" class="form-input flex-1 input-roster-away-name text-sm" data-idx="${idx}" value="${r.name}" placeholder="Rider Name">
              <input type="number" step="0.01" class="form-input w-20 text-center input-roster-away-cma text-sm" data-idx="${idx}" value="${r.cma}" placeholder="CMA">
              <label class="flex items-center gap-1 text-[0.68rem] text-muted font-bold cursor-pointer" title="Rider Replacement facility">
                <input type="checkbox" class="input-roster-away-rr" data-idx="${idx}" ${r.isRiderReplacement ? 'checked' : ''}>
                R/R
              </label>
            </div>
          `).join('')}
        </div>
      </div>

      <button class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl shadow-lg mb-6" id="btn-save-rosters">
        Update Rosters & Heat Riders
      </button>
    `;
  }

  renderMatchHistory(savedMatches) {
    return `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200">Saved Matches</h3>
          <span class="text-xs text-muted">${savedMatches.length} matches</span>
        </div>

        ${savedMatches.length === 0 ? `
          <div class="text-center py-6 text-slate-500 text-xs italic">No previous matches recorded yet.</div>
        ` : `
          <div class="space-y-2.5">
            ${savedMatches.map((m) => `
              <div class="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div class="font-bold text-sm text-slate-100">${m.title || `${m.homeTeamName} vs ${m.awayTeamName}`}</div>
                  <div class="text-xs text-slate-400">${m.league || 'British League'} · ${m.date || ''}</div>
                  <div class="text-xs font-black text-amber-400 mt-1">Score: ${m.homeScore} - ${m.awayScore}</div>
                </div>
                <div class="flex gap-2">
                  <button class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold btn-load-saved-match" data-id="${m.id}">Load</button>
                  <button class="bg-red-950 text-red-400 px-2 py-1.5 rounded-lg text-xs font-bold btn-delete-saved-match" data-id="${m.id}">&times;</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Backup & Data Export / Import -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3">Data Backup & Export</h3>
        <div class="grid grid-cols-2 gap-2">
          <button class="bg-slate-800 border border-slate-700 text-slate-200 p-2.5 rounded-xl text-xs font-bold" id="btn-export-csv">
            📊 Export CSV
          </button>
          <button class="bg-slate-800 border border-slate-700 text-slate-200 p-2.5 rounded-xl text-xs font-bold" id="btn-export-json">
            💾 Backup JSON
          </button>
        </div>
      </div>
    `;
  }

  renderSettings() {
    const s = this.app.settings;
    return `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200">App Preferences</h3>

        <div class="flex items-center justify-between">
          <div>
            <div class="font-bold text-sm text-slate-100">Theme Mode</div>
            <div class="text-xs text-muted">Dark stadium floodlight or light mode</div>
          </div>
          <select class="form-select w-32 text-xs" id="setting-theme">
            <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>🌙 Dark</option>
            <option value="light" ${s.theme === 'light' ? 'selected' : ''}>☀️ Light</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div class="font-bold text-sm text-slate-100">Haptic Touch Feedback</div>
            <div class="text-xs text-muted">Vibrate / tactile response on scoring taps</div>
          </div>
          <input type="checkbox" id="setting-haptics" class="w-5 h-5 rounded" ${s.hapticsEnabled ? 'checked' : ''}>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div class="font-bold text-sm text-slate-100">Auto-Advance Heats</div>
            <div class="text-xs text-muted">Automatically move to next heat when scored</div>
          </div>
          <input type="checkbox" id="setting-autoadvance" class="w-5 h-5 rounded" ${s.autoAdvanceHeat ? 'checked' : ''}>
        </div>
      </div>

      <!-- iPhone PWA Installation Guide -->
      <div class="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/60 rounded-2xl p-4 mb-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-blue-400 mb-2">📱 Add to iPhone Home Screen</h3>
        <p class="text-xs text-slate-300 mb-3">For full-screen stadium scoring without browser address bars:</p>
        <ol class="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
          <li>Tap the <strong>Share</strong> button in Safari (<svg class="inline w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>)</li>
          <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
          <li>Tap <strong>Add</strong> to launch as a standalone app!</li>
        </ol>
      </div>
    `;
  }

  bindEvents(match) {
    // Sub tab switching
    this.container.querySelectorAll('.btn-sub-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeSection = btn.getAttribute('data-section');
        this.app.playHapticFeedback();
        this.render();
      });
    });

    // Home Team Dropdown Change
    const homeSelect = this.container.querySelector('#select-home-preset');
    if (homeSelect) {
      homeSelect.addEventListener('change', (e) => {
        const teamName = e.target.value;
        if (teamName) {
          this.app.playHapticFeedback();
          this.app.setTeam('home', teamName, true);
          this.render();
        }
      });
    }

    // Away Team Dropdown Change
    const awaySelect = this.container.querySelector('#select-away-preset');
    if (awaySelect) {
      awaySelect.addEventListener('change', (e) => {
        const teamName = e.target.value;
        if (teamName) {
          this.app.playHapticFeedback();
          this.app.setTeam('away', teamName, true);
          this.render();
        }
      });
    }

    // Home preset chip quick click
    this.container.querySelectorAll('.btn-set-home-preset').forEach((chip) => {
      chip.addEventListener('click', () => {
        const name = chip.getAttribute('data-name');
        if (name) {
          this.app.playHapticFeedback();
          this.app.setTeam('home', name, true);
          this.render();
        }
      });
    });

    // Away preset chip quick click
    this.container.querySelectorAll('.btn-set-away-preset').forEach((chip) => {
      chip.addEventListener('click', () => {
        const name = chip.getAttribute('data-name');
        if (name) {
          this.app.playHapticFeedback();
          this.app.setTeam('away', name, true);
          this.render();
        }
      });
    });

    // Reset team roster button
    this.container.querySelectorAll('.btn-reset-team-roster').forEach((btn) => {
      btn.addEventListener('click', () => {
        const teamKey = btn.getAttribute('data-team');
        const teamName = teamKey === 'home' ? match.homeTeamName : match.awayTeamName;
        const defaultRoster = getRosterForTeam(teamName, teamKey === 'home');
        if (teamKey === 'home') {
          this.app.updateRosters(defaultRoster, match.awayRoster);
        } else {
          this.app.updateRosters(match.homeRoster, defaultRoster);
        }
        this.render();
        this.app.showToast(`Reset ${teamName} roster to defaults`);
      });
    });

    // Save match details
    const saveMatchBtn = this.container.querySelector('#btn-save-match-info');
    if (saveMatchBtn) {
      saveMatchBtn.addEventListener('click', () => {
        const homeName = this.container.querySelector('#input-home-team')?.value || 'Home Team';
        const awayName = this.container.querySelector('#input-away-team')?.value || 'Away Team';
        const track = this.container.querySelector('#input-track')?.value || '';
        const league = this.container.querySelector('#input-league')?.value || 'SGB Premiership';
        const date = this.container.querySelector('#input-date')?.value || '';
        const referee = this.container.querySelector('#input-referee')?.value || '';
        const heat1gates = this.container.querySelector('#input-toss-choice1')?.value || 'home';
        const heat15gates = this.container.querySelector('#input-toss-choice15')?.value || 'home';

        this.app.updateMatchMetadata({
          homeTeamName: homeName,
          awayTeamName: awayName,
          track,
          league,
          date,
          referee,
          heat1gates,
          heat15gates,
        }, true);

        this.app.showToast('Match details & rosters updated! 🏁');
        this.app.playHapticFeedback();
        this.render();
      });
    }

    // Start New Match
    const startNewBtn = this.container.querySelector('#btn-start-new-match');
    if (startNewBtn) {
      startNewBtn.addEventListener('click', () => {
        if (confirm('Start a new match with these teams? Current match will be saved to history.')) {
          const homeName = this.container.querySelector('#input-home-team')?.value || 'Belle Vue Aces';
          const awayName = this.container.querySelector('#input-away-team')?.value || 'Sheffield Tigers';
          const track = this.container.querySelector('#input-track')?.value || 'National Speedway Stadium';
          const league = this.container.querySelector('#input-league')?.value || 'SGB Premiership';
          const heat1gates = this.container.querySelector('#input-toss-choice1')?.value || 'home';
          const heat15gates = this.container.querySelector('#input-toss-choice15')?.value || 'home';

          const newMatch = createNewMatch({
            homeTeamName: homeName,
            awayTeamName: awayName,
            track,
            league,
            heat1gates,
            heat15gates,
          });

          this.app.setMatch(newMatch);
          this.app.setActiveTab('heats');
          this.app.showToast(`New match ready: ${homeName} vs ${awayName}! 🏁`);
        }
      });
    }

    const resetCurrentMatchBtn = this.container.querySelector('#btn-reset-current-match');
    if (resetCurrentMatchBtn) {
      resetCurrentMatchBtn.addEventListener('click', () => {
        if (confirm('Reset the current match schedule to the default programmed heat matrix?')) {
          this.app.resetCurrentMatch();
          this.app.setActiveTab('heats');
        }
      });
    }

    // Save Rosters manually
    const saveRostersBtn = this.container.querySelector('#btn-save-rosters');
    if (saveRostersBtn) {
      saveRostersBtn.addEventListener('click', () => {
        const homeInputs = this.container.querySelectorAll('.input-roster-home-name');
        const homeCmaInputs = this.container.querySelectorAll('.input-roster-home-cma');
        const homeRrInputs = this.container.querySelectorAll('.input-roster-home-rr');

        const newHomeRoster = match.homeRoster.map((r, idx) => ({
          ...r,
          name: homeInputs[idx]?.value || r.name,
          cma: parseFloat(homeCmaInputs[idx]?.value) || r.cma,
          isRiderReplacement: homeRrInputs[idx]?.checked || false,
        }));

        const awayInputs = this.container.querySelectorAll('.input-roster-away-name');
        const awayCmaInputs = this.container.querySelectorAll('.input-roster-away-cma');
        const awayRrInputs = this.container.querySelectorAll('.input-roster-away-rr');

        const newAwayRoster = match.awayRoster.map((r, idx) => ({
          ...r,
          name: awayInputs[idx]?.value || r.name,
          cma: parseFloat(awayCmaInputs[idx]?.value) || r.cma,
          isRiderReplacement: awayRrInputs[idx]?.checked || false,
        }));

        this.app.updateRosters(newHomeRoster, newAwayRoster);
        this.app.showToast('Rosters updated & synced to all heats! 👥');
        this.app.playHapticFeedback();
      });
    }

    // Load saved match
    this.container.querySelectorAll('.btn-load-saved-match').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.app.loadMatch(id);
        this.app.setActiveTab('heats');
        this.app.showToast('Loaded match! 📂');
      });
    });

    // Delete saved match
    this.container.querySelectorAll('.btn-delete-saved-match').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this match from history?')) {
          storageService.deleteMatch(id);
          this.render();
          this.app.showToast('Match deleted');
        }
      });
    });

    // Export CSV
    const exportCsvBtn = this.container.querySelector('#btn-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this.app.exportCSV());
    }

    // Export JSON
    const exportJsonBtn = this.container.querySelector('#btn-export-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.app.exportJSON());
    }

    // Settings changes
    const themeSelect = this.container.querySelector('#setting-theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.app.setTheme(e.target.value);
      });
    }

    const hapticsCheck = this.container.querySelector('#setting-haptics');
    if (hapticsCheck) {
      hapticsCheck.addEventListener('change', (e) => {
        this.app.updateSetting('hapticsEnabled', e.target.checked);
      });
    }

    const autoAdvanceCheck = this.container.querySelector('#setting-autoadvance');
    if (autoAdvanceCheck) {
      autoAdvanceCheck.addEventListener('change', (e) => {
        this.app.updateSetting('autoAdvanceHeat', e.target.checked);
      });
    }
  }
}
