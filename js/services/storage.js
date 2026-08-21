/**
 * Speedway Scorecard - Storage & State History Service
 * Handles instant persistence to LocalStorage / IndexedDB,
 * Undo/Redo stacks, match archive, and backup export/import.
 */

const CURRENT_MATCH_KEY = 'speedway_current_match';
const MATCHES_INDEX_KEY = 'speedway_matches_list';
const SETTINGS_KEY = 'speedway_app_settings';

const MAX_HISTORY_STEPS = 50;

export class StorageService {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = new Set();
  }

  /**
   * Loads user settings
   */
  getSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : {
        theme: 'dark', // 'dark' | 'light'
        hapticsEnabled: true,
        autoAdvanceHeat: true,
        showBonusBadges: true,
        highContrast: false,
      };
    } catch (e) {
      console.error('Error reading settings', e);
      return { theme: 'dark', hapticsEnabled: true, autoAdvanceHeat: true, showBonusBadges: true, highContrast: false };
    }
  }

  /**
   * Saves user settings
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }

  /**
   * Saves current active match and records an undo snapshot if requested
   */
  saveCurrentMatch(match, recordHistory = true) {
    if (!match) return;

    if (recordHistory) {
      // Save current serialized snapshot to undo stack
      const previous = this.getCurrentMatch();
      if (previous && JSON.stringify(previous) !== JSON.stringify(match)) {
        this.undoStack.push(JSON.stringify(previous));
        if (this.undoStack.length > MAX_HISTORY_STEPS) {
          this.undoStack.shift();
        }
        // Clear redo stack on new action
        this.redoStack = [];
      }
    }

    try {
      const matchWithTimestamp = {
        ...match,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(CURRENT_MATCH_KEY, JSON.stringify(matchWithTimestamp));
      this.updateMatchesIndex(matchWithTimestamp);
    } catch (e) {
      console.error('Error saving match to localStorage', e);
    }
  }

  /**
   * Retrieves active match
   */
  getCurrentMatch() {
    try {
      const data = localStorage.getItem(CURRENT_MATCH_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading current match', e);
      return null;
    }
  }

  /**
   * Undo last action
   */
  undo(currentMatch) {
    if (this.undoStack.length === 0) return null;

    const previousSnapshot = this.undoStack.pop();
    if (currentMatch) {
      this.redoStack.push(JSON.stringify(currentMatch));
    }

    const match = JSON.parse(previousSnapshot);
    this.saveCurrentMatch(match, false);
    return match;
  }

  /**
   * Redo action
   */
  redo(currentMatch) {
    if (this.redoStack.length === 0) return null;

    const nextSnapshot = this.redoStack.pop();
    if (currentMatch) {
      this.undoStack.push(JSON.stringify(currentMatch));
    }

    const match = JSON.parse(nextSnapshot);
    this.saveCurrentMatch(match, false);
    return match;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Maintains list of all saved/archived matches
   */
  getSavedMatchesList() {
    try {
      const data = localStorage.getItem(MATCHES_INDEX_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  updateMatchesIndex(match) {
    try {
      const list = this.getSavedMatchesList();
      const existingIndex = list.findIndex((m) => m.id === match.id);
      const summaryItem = {
        id: match.id,
        title: match.title || `${match.homeTeamName} vs ${match.awayTeamName}`,
        homeTeamName: match.homeTeamName,
        awayTeamName: match.awayTeamName,
        track: match.track,
        league: match.league,
        date: match.date,
        homeScore: match.homeScore || 0,
        awayScore: match.awayScore || 0,
        isCompleted: match.isCompleted || false,
        updatedAt: match.updatedAt || new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        list[existingIndex] = summaryItem;
      } else {
        list.unshift(summaryItem);
      }

      localStorage.setItem(MATCHES_INDEX_KEY, JSON.stringify(list));
      localStorage.setItem(`match_archive_${match.id}`, JSON.stringify(match));
    } catch (e) {
      console.error('Error updating matches index', e);
    }
  }

  loadMatchById(id) {
    try {
      const data = localStorage.getItem(`match_archive_${id}`);
      if (data) {
        const match = JSON.parse(data);
        this.saveCurrentMatch(match, false);
        this.undoStack = [];
        this.redoStack = [];
        return match;
      }
      return null;
    } catch (e) {
      console.error('Error loading match', e);
      return null;
    }
  }

  deleteMatch(id) {
    try {
      let list = this.getSavedMatchesList();
      list = list.filter((m) => m.id !== id);
      localStorage.setItem(MATCHES_INDEX_KEY, JSON.stringify(list));
      localStorage.removeItem(`match_archive_${id}`);
    } catch (e) {
      console.error('Error deleting match', e);
    }
  }

  exportMatchJSON(match) {
    return JSON.stringify(match, null, 2);
  }

  importMatchJSON(jsonString) {
    try {
      const match = JSON.parse(jsonString);
      if (!match.heats || !match.homeRoster || !match.awayRoster) {
        throw new Error('Invalid match data structure');
      }
      match.id = `match-${Date.now()}`;
      this.saveCurrentMatch(match, false);
      return match;
    } catch (e) {
      throw new Error(`Import failed: ${e.message}`);
    }
  }
}

export const storageService = new StorageService();

