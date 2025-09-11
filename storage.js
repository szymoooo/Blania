/* ========================================
   STORAGE MODULE - Obsługa localStorage
   Usunięto duplikaty i scentralizowano
   ======================================== */

/**
 * Klasa do zarządzania danymi w localStorage
 * Zapewnia bezpieczne operacje CRUD z obsługą błędów
 * @class StorageManager
 */
class StorageManager {
    /**
     * Tworzy instancję StorageManager
     * @constructor
     */
    constructor() {
        /** @type {Object} Klucze używane w localStorage */
        this.keys = AppConfig.STORAGE_KEYS;
    }

    /**
     * Bezpieczne parsowanie JSON z obsługą błędów
     * @param {string} jsonString - String JSON do sparsowania
     * @param {*} defaultValue - Wartość domyślna w przypadku błędu
     * @returns {*} Sparsowany obiekt lub wartość domyślna
     */
    safeJsonParse(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('Błąd parsowania JSON:', e);
            return defaultValue;
        }
    }

    /**
     * Pobiera dane z localStorage
     * @param {string} key - Klucz w localStorage
     * @param {*} defaultValue - Wartość domyślna jeśli klucz nie istnieje
     * @returns {*} Wartość z localStorage lub wartość domyślna
     */
    get(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        return value ? this.safeJsonParse(value, defaultValue) : defaultValue;
    }

    /**
     * Zapisuje dane do localStorage
     * @param {string} key - Klucz w localStorage
     * @param {*} value - Wartość do zapisania
     * @returns {boolean} True jeśli zapisano pomyślnie, false w przypadku błędu
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Błąd zapisywania do localStorage:', e);
            return false;
        }
    }

    /**
     * Usuwa dane z localStorage
     * @param {string} key - Klucz do usunięcia
     */
    remove(key) {
        localStorage.removeItem(key);
    }

    /**
     * Usuwa wiele kluczy z localStorage
     * @param {string[]} keys - Tablica kluczy do usunięcia
     */
    removeMultiple(keys) {
        keys.forEach(key => this.remove(key));
    }

    /**
     * Sprawdza czy klucz istnieje w localStorage
     * @param {string} key - Klucz do sprawdzenia
     * @returns {boolean} True jeśli klucz istnieje
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    }

    /**
     * Czyści wszystkie dane aplikacji z localStorage
     */
    clear() {
        Object.values(this.keys).forEach(key => this.remove(key));
    }

    // ===== SPECJALNE METODY DLA APLIKACJI =====

    // Mecze
    getSavedMatches() {
        return this.get(this.keys.SAVED_MATCHES, []);
    }
    
    getMatches() {
        return this.getSavedMatches();
    }

    saveMatch(match) {
        const matches = this.getSavedMatches();
        const existingIndex = matches.findIndex(m => m.id === match.id);
        
        if (existingIndex !== -1) {
            matches[existingIndex] = match;
        } else {
            matches.push(match);
        }
        
        return this.set(this.keys.SAVED_MATCHES, matches);
    }

    deleteMatch(matchId) {
        const matches = this.getSavedMatches();
        const filteredMatches = matches.filter(m => m.id !== matchId);
        return this.set(this.keys.SAVED_MATCHES, filteredMatches);
    }

    // Wydarzenia
    getSavedEvents() {
        return this.get(this.keys.SAVED_EVENTS, []);
    }
    
    getEvents() {
        return this.getSavedEvents();
    }

    saveEvent(event) {
        const events = this.getSavedEvents();
        const existingIndex = events.findIndex(e => e.id === event.id);
        
        if (existingIndex !== -1) {
            events[existingIndex] = event;
        } else {
            events.push(event);
        }
        
        return this.set(this.keys.SAVED_EVENTS, events);
    }

    deleteEvent(eventId) {
        const events = this.getSavedEvents();
        const filteredEvents = events.filter(e => e.id !== eventId);
        return this.set(this.keys.SAVED_EVENTS, filteredEvents);
    }

    // Notatki
    getNotes() {
        return this.get(this.keys.NOTES, {});
    }

    saveNotes(notes) {
        return this.set(this.keys.NOTES, notes);
    }
    
    saveNote(note) {
        const notes = this.getNotes();
        notes.push(note);
        return this.saveNotes(notes);
    }

    getTeamNotes(team) {
        const notes = this.getNotes();
        return notes[team] || [];
    }

    saveTeamNote(team, note, noteIndex = null) {
        const notes = this.getNotes();
        if (!notes[team]) {
            notes[team] = [];
        }
        
        if (noteIndex !== null) {
            notes[team][noteIndex] = note;
        } else {
            notes[team].push(note);
        }
        
        return this.saveNotes(notes);
    }

    // Google Auth
    getGoogleUser() {
        return this.get(this.keys.GOOGLE_USER);
    }

    setGoogleUser(user) {
        return this.set(this.keys.GOOGLE_USER, user);
    }

    getGoogleAccessToken() {
        return this.get(this.keys.GOOGLE_ACCESS_TOKEN);
    }

    setGoogleAccessToken(token) {
        return this.set(this.keys.GOOGLE_ACCESS_TOKEN, token);
    }

    clearGoogleAuth() {
        this.remove(this.keys.GOOGLE_USER);
        this.remove(this.keys.GOOGLE_ACCESS_TOKEN);
    }

    // Inne
    getCurrentTeam() {
        return this.get(this.keys.CURRENT_TEAM, 'BAT Sierakowice');
    }

    setCurrentTeam(team) {
        return this.set(this.keys.CURRENT_TEAM, team);
    }

    getSelectedTeam() {
        return this.get(this.keys.SELECTED_TEAM);
    }

    setSelectedTeam(team) {
        return this.set(this.keys.SELECTED_TEAM, team);
    }

    getSelectedDate() {
        return this.get(this.keys.SELECTED_DATE);
    }

    setSelectedDate(date) {
        return this.set(this.keys.SELECTED_DATE, date);
    }

    // Edycja
    getEditMatchId() {
        return this.get(this.keys.EDIT_MATCH_ID);
    }

    setEditMatchId(id) {
        return this.set(this.keys.EDIT_MATCH_ID, id);
    }

    getEditEventId() {
        return this.get(this.keys.EDIT_EVENT_ID);
    }

    setEditEventId(id) {
        return this.set(this.keys.EDIT_EVENT_ID, id);
    }

    getCurrentNoteIndex() {
        return this.get(this.keys.CURRENT_NOTE_INDEX);
    }

    setCurrentNoteIndex(index) {
        return this.set(this.keys.CURRENT_NOTE_INDEX, index);
    }

    getNoteToEdit() {
        return this.get(this.keys.NOTE_TO_EDIT);
    }

    setNoteToEdit(note) {
        return this.set(this.keys.NOTE_TO_EDIT, note);
    }

    // Wyczyść dane edycji
    clearEditData() {
        this.removeMultiple([
            this.keys.EDIT_MATCH_ID,
            this.keys.EDIT_EVENT_ID,
            this.keys.SELECTED_TEAM,
            this.keys.SELECTED_DATE,
            this.keys.CURRENT_NOTE_INDEX,
            this.keys.NOTE_TO_EDIT
        ]);
    }
}

// Utwórz globalną instancję
window.storage = new StorageManager();
