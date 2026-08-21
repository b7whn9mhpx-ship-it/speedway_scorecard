/**
 * Speedway Scorecard - Export and Sharing Service
 * Generates formatted text summaries, CSV data, and printable scorecard documents.
 */

export class ExporterService {
  /**
   * Generates a clean, readable text match report for messaging and social media
   */
  static generateTextSummary(match) {
    if (!match) return '';

    const lines = [];
    const dateStr = match.date || '';
    const trackStr = match.track ? ` | ${match.track}` : '';
    const leagueStr = match.league ? `${match.league}` : 'Speedway Match';

    lines.push(`🏁 SPEEDWAY SCORECARD 🏁`);
    lines.push(`${match.homeTeamName.toUpperCase()} ${match.homeScore} - ${match.awayScore} ${match.awayTeamName.toUpperCase()}`);
    lines.push(`${leagueStr}${trackStr} (${dateStr})`);
    if (match.referee) lines.push(`Referee: ${match.referee}`);
    lines.push('----------------------------------------');

    // Home Scorers
    lines.push(`\n🔵 ${match.homeTeamName.toUpperCase()} (${match.homeScore}):`);
    if (match.homeRiderStats) {
      match.homeRiderStats.forEach((r) => {
        const trail = r.rides && r.rides.length > 0 ? r.rides.map((rd) => rd.display).join(', ') : 'No rides';
        const bonusStr = r.totalBonus > 0 ? `+${r.totalBonus}` : '';
        lines.push(`${r.number}. ${r.name.padEnd(20)} [${trail}] = ${r.totalPoints}${bonusStr}`);
      });
    }

    // Away Scorers
    lines.push(`\n🟡 ${match.awayTeamName.toUpperCase()} (${match.awayScore}):`);
    if (match.awayRiderStats) {
      match.awayRiderStats.forEach((r) => {
        const trail = r.rides && r.rides.length > 0 ? r.rides.map((rd) => rd.display).join(', ') : 'No rides';
        const bonusStr = r.totalBonus > 0 ? `+${r.totalBonus}` : '';
        lines.push(`${r.number}. ${r.name.padEnd(20)} [${trail}] = ${r.totalPoints}${bonusStr}`);
      });
    }

    // Heat-by-Heat details
    lines.push('\n----------------------------------------');
    lines.push('HEAT RESULTS:');
    match.heats.forEach((h) => {
      if (h.status === 'completed' || h.riders.some((r) => r.position !== null || r.exclusionCode)) {
        // Sort finishers 1st, 2nd, 3rd, 4th, exclusions
        const finishers = [...h.riders]
          .filter((r) => r.position !== null)
          .sort((a, b) => (a.position || 99) - (b.position || 99))
          .map((r) => `${r.riderName || `#${r.riderNumber}`}${r.bonus ? '*' : ''}`);

        const excluded = [...h.riders]
          .filter((r) => r.exclusionCode)
          .map((r) => `${r.riderName || `#${r.riderNumber}`} (${r.exclusionCode})`);

        const allResults = [...finishers, ...excluded].join(', ');
        const timeStr = h.timeSeconds ? ` [${h.timeSeconds}s]` : '';
        const heatScoreStr = `(${h.homeScore}-${h.awayScore})`;
        const runningStr = `${h.runningHomeScore || h.homeScore}-${h.runningAwayScore || h.awayScore}`;

        lines.push(`Ht ${h.heatNumber.toString().padStart(2, ' ')}: ${allResults || 'No finishers'} ${heatScoreStr} ${runningStr}${timeStr}`);
      }
    });

    if (match.mvpRider) {
      lines.push('\n----------------------------------------');
      lines.push(`⭐ Top Scorer: ${match.mvpRider.name} (${match.mvpRider.totalPoints}${match.mvpRider.totalBonus > 0 ? `+${match.mvpRider.totalBonus}` : ''} pts)`);
    }

    lines.push('\nScored with Speedway Match Scorecard PWA');
    return lines.join('\n');
  }

  /**
   * Generates CSV format for spreadsheet analysis
   */
  static generateCSV(match) {
    if (!match) return '';
    const rows = [];

    // Header metadata
    rows.push(['Match', `${match.homeTeamName} vs ${match.awayTeamName}`]);
    rows.push(['League', match.league || '']);
    rows.push(['Track', match.track || '']);
    rows.push(['Date', match.date || '']);
    rows.push(['Final Score', `${match.homeScore} - ${match.awayScore}`]);
    rows.push([]);

    // Rider Summary
    rows.push(['Team', 'No.', 'Rider', 'Rides', '1st', '2nd', '3rd', '0/Ex', 'Points', 'Bonus', 'Paid Pts', 'Avg', 'CMA']);

    const addRiderRows = (teamName, stats) => {
      (stats || []).forEach((r) => {
        rows.push([
          teamName,
          r.number,
          r.name,
          r.rideCount,
          r.firsts,
          r.seconds,
          r.thirds,
          r.unplaced + r.exclusions,
          r.totalPoints,
          r.totalBonus,
          r.paidPoints,
          r.average,
          r.cma,
        ]);
      });
    };

    addRiderRows(match.homeTeamName, match.homeRiderStats);
    addRiderRows(match.awayTeamName, match.awayRiderStats);
    rows.push([]);

    // Heat Grid
    rows.push(['Heat', 'Home Score', 'Away Score', 'Running Home', 'Running Away', 'Time (s)', 'Gate 1', 'Gate 2', 'Gate 3', 'Gate 4']);
    match.heats.forEach((h) => {
      const getGateRider = (gateNum) => {
        const r = h.riders.find((rd) => rd.gate === gateNum);
        if (!r) return '';
        const pts = r.points !== null ? `(${r.points}${r.bonus ? '*' : ''}${r.exclusionCode ? r.exclusionCode : ''})` : '';
        return `${r.riderName || `#${r.riderNumber}`} ${pts}`;
      };

      rows.push([
        h.heatNumber,
        h.homeScore,
        h.awayScore,
        h.runningHomeScore || h.homeScore,
        h.runningAwayScore || h.awayScore,
        h.timeSeconds || '',
        getGateRider(1),
        getGateRider(2),
        getGateRider(3),
        getGateRider(4),
      ]);
    });

    return rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  /**
   * Triggers native web sharing or falls back to clipboard copy
   */
  static async shareScorecard(match) {
    const text = this.generateTextSummary(match);
    const title = `${match.homeTeamName} ${match.homeScore} - ${match.awayScore} ${match.awayTeamName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
        });
        return { success: true, method: 'share' };
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.warn('Share error', e);
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Downloads a text or CSV file on mobile / desktop
   */
  static downloadFile(content, fileName, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

