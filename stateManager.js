/* ========================================
   STATE MANAGER - Centralne zarządzanie stanem
   Rozwiązuje problemy z rozproszonym stanem
   ======================================== */

class StateManager {
    constructor() {
        this.state = {
            // User state
            user: {
                isLoggedIn: false,
                googleUser: null,
                accessToken: null,
                tokenExpiration: null
            },
            
            // UI state
            ui: {
                currentPage: 1,
                currentTeam: 'BAT Sierakowice',
                currentNoteIndex: 0,
                currentWeekStart: new Date(),
                isLoading: false,
                error: null
            },
            
            // Data state
            data: {
                matches: [],
                events: [],
                notes: {},
                teams: []
            },
            
            // Edit state
            edit: {
                matchId: null,
                eventId: null,
                noteIndex: null,
                selectedTeam: null,
                selectedDate: null,
                noteToEdit: null
            }
        };
        
        this.listeners = new Map();
        this.middleware = [];
    }

    // ===== CORE STATE METHODS =====
    
    getState() {
        return { ...this.state };
    }
    
    getStateSlice(path) {
        return this.getNestedValue(this.state, path);
    }
    
    setState(newState, path = null) {
        const prevState = { ...this.state };
        
        if (path) {
            this.setNestedValue(this.state, path, newState);
        } else {
            this.state = { ...this.state, ...newState };
        }
        
        this.notifyListeners(prevState, this.state);
        this.saveToStorage();
    }
    
    // ===== SUBSCRIPTION SYSTEM =====
    
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        
        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(path);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(path);
                }
            }
        };
    }
    
    notifyListeners(prevState, newState) {
        this.listeners.forEach((callbacks, path) => {
            const prevValue = this.getNestedValue(prevState, path);
            const newValue = this.getNestedValue(newState, path);
            
            if (JSON.stringify(prevValue) !== JSON.stringify(newValue)) {
                callbacks.forEach(callback => {
                    try {
                        callback(newValue, prevValue);
                    } catch (error) {
                        console.error('Error in state listener:', error);
                    }
                });
            }
        });
    }
    
    // ===== MIDDLEWARE SYSTEM =====
    
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    
    applyMiddleware(action, payload) {
        return this.middleware.reduce((result, middleware) => {
            return middleware(result, this.state);
        }, { action, payload });
    }
    
    // ===== ACTION DISPATCHER =====
    
    dispatch(action, payload = null) {
        const middlewareResult = this.applyMiddleware({ action, payload }, this.state);
        
        switch (action) {
            // User actions
            case 'LOGIN':
                this.handleLogin(payload);
                break;
            case 'LOGOUT':
                this.handleLogout();
                break;
            case 'SET_ACCESS_TOKEN':
                this.handleSetAccessToken(payload);
                break;
                
            // UI actions
            case 'SET_CURRENT_PAGE':
                this.handleSetCurrentPage(payload);
                break;
            case 'SET_CURRENT_TEAM':
                this.handleSetCurrentTeam(payload);
                break;
            case 'SET_LOADING':
                this.handleSetLoading(payload);
                break;
            case 'SET_ERROR':
                this.handleSetError(payload);
                break;
            case 'CLEAR_ERROR':
                this.handleClearError();
                break;
                
            // Data actions
            case 'LOAD_MATCHES':
                this.handleLoadMatches(payload);
                break;
            case 'ADD_MATCH':
                this.handleAddMatch(payload);
                break;
            case 'UPDATE_MATCH':
                this.handleUpdateMatch(payload);
                break;
            case 'DELETE_MATCH':
                this.handleDeleteMatch(payload);
                break;
            case 'LOAD_EVENTS':
                this.handleLoadEvents(payload);
                break;
            case 'ADD_EVENT':
                this.handleAddEvent(payload);
                break;
            case 'UPDATE_EVENT':
                this.handleUpdateEvent(payload);
                break;
            case 'DELETE_EVENT':
                this.handleDeleteEvent(payload);
                break;
            case 'LOAD_NOTES':
                this.handleLoadNotes(payload);
                break;
            case 'ADD_NOTE':
                this.handleAddNote(payload);
                break;
            case 'UPDATE_NOTE':
                this.handleUpdateNote(payload);
                break;
            case 'DELETE_NOTE':
                this.handleDeleteNote(payload);
                break;
                
            // Edit actions
            case 'SET_EDIT_MATCH':
                this.handleSetEditMatch(payload);
                break;
            case 'SET_EDIT_EVENT':
                this.handleSetEditEvent(payload);
                break;
            case 'SET_EDIT_NOTE':
                this.handleSetEditNote(payload);
                break;
            case 'CLEAR_EDIT_STATE':
                this.handleClearEditState();
                break;
                
            default:
                console.warn('Unknown action:', action);
        }
    }
    
    // ===== ACTION HANDLERS =====
    
    // User handlers
    handleLogin(user) {
        this.setState({
            user: {
                isLoggedIn: true,
                googleUser: user,
                accessToken: this.state.user.accessToken,
                tokenExpiration: user.exp ? user.exp * 1000 : null
            }
        });
    }
    
    handleLogout() {
        this.setState({
            user: {
                isLoggedIn: false,
                googleUser: null,
                accessToken: null,
                tokenExpiration: null
            }
        });
    }
    
    handleSetAccessToken(token) {
        this.setState({
            user: {
                ...this.state.user,
                accessToken: token
            }
        });
    }
    
    // UI handlers
    handleSetCurrentPage(page) {
        this.setState({
            ui: {
                ...this.state.ui,
                currentPage: page
            }
        });
    }
    
    handleSetCurrentTeam(team) {
        this.setState({
            ui: {
                ...this.state.ui,
                currentTeam: team
            }
        });
    }
    
    handleSetLoading(isLoading) {
        this.setState({
            ui: {
                ...this.state.ui,
                isLoading: isLoading
            }
        });
    }
    
    handleSetError(error) {
        this.setState({
            ui: {
                ...this.state.ui,
                error: error
            }
        });
    }
    
    handleClearError() {
        this.setState({
            ui: {
                ...this.state.ui,
                error: null
            }
        });
    }
    
    // Data handlers
    handleLoadMatches(matches) {
        this.setState({
            data: {
                ...this.state.data,
                matches: matches
            }
        });
    }
    
    handleAddMatch(match) {
        const newMatches = [...this.state.data.matches, match];
        this.setState({
            data: {
                ...this.state.data,
                matches: newMatches
            }
        });
    }
    
    handleUpdateMatch(updatedMatch) {
        const newMatches = this.state.data.matches.map(match => 
            match.id === updatedMatch.id ? updatedMatch : match
        );
        this.setState({
            data: {
                ...this.state.data,
                matches: newMatches
            }
        });
    }
    
    handleDeleteMatch(matchId) {
        const newMatches = this.state.data.matches.filter(match => match.id !== matchId);
        this.setState({
            data: {
                ...this.state.data,
                matches: newMatches
            }
        });
    }
    
    handleLoadEvents(events) {
        this.setState({
            data: {
                ...this.state.data,
                events: events
            }
        });
    }
    
    handleAddEvent(event) {
        const newEvents = [...this.state.data.events, event];
        this.setState({
            data: {
                ...this.state.data,
                events: newEvents
            }
        });
    }
    
    handleUpdateEvent(updatedEvent) {
        const newEvents = this.state.data.events.map(event => 
            event.id === updatedEvent.id ? updatedEvent : event
        );
        this.setState({
            data: {
                ...this.state.data,
                events: newEvents
            }
        });
    }
    
    handleDeleteEvent(eventId) {
        const newEvents = this.state.data.events.filter(event => event.id !== eventId);
        this.setState({
            data: {
                ...this.state.data,
                events: newEvents
            }
        });
    }
    
    handleLoadNotes(notes) {
        this.setState({
            data: {
                ...this.state.data,
                notes: notes
            }
        });
    }
    
    handleAddNote({ team, note }) {
        const newNotes = {
            ...this.state.data.notes,
            [team]: [...(this.state.data.notes[team] || []), note]
        };
        this.setState({
            data: {
                ...this.state.data,
                notes: newNotes
            }
        });
    }
    
    handleUpdateNote({ team, noteIndex, note }) {
        const newNotes = {
            ...this.state.data.notes,
            [team]: this.state.data.notes[team].map((n, index) => 
                index === noteIndex ? note : n
            )
        };
        this.setState({
            data: {
                ...this.state.data,
                notes: newNotes
            }
        });
    }
    
    handleDeleteNote({ team, noteIndex }) {
        const newNotes = {
            ...this.state.data.notes,
            [team]: this.state.data.notes[team].filter((_, index) => index !== noteIndex)
        };
        this.setState({
            data: {
                ...this.state.data,
                notes: newNotes
            }
        });
    }
    
    // Edit handlers
    handleSetEditMatch(matchId) {
        this.setState({
            edit: {
                ...this.state.edit,
                matchId: matchId
            }
        });
    }
    
    handleSetEditEvent(eventId) {
        this.setState({
            edit: {
                ...this.state.edit,
                eventId: eventId
            }
        });
    }
    
    handleSetEditNote({ noteIndex, note }) {
        this.setState({
            edit: {
                ...this.state.edit,
                noteIndex: noteIndex,
                noteToEdit: note
            }
        });
    }
    
    handleClearEditState() {
        this.setState({
            edit: {
                matchId: null,
                eventId: null,
                noteIndex: null,
                selectedTeam: null,
                selectedDate: null,
                noteToEdit: null
            }
        });
    }
    
    // ===== STORAGE INTEGRATION =====
    
    saveToStorage() {
        try {
            // Save critical state to localStorage
            localStorage.setItem('appState', JSON.stringify({
                user: this.state.user,
                ui: {
                    currentTeam: this.state.ui.currentTeam,
                    currentPage: this.state.ui.currentPage
                },
                edit: this.state.edit
            }));
        } catch (error) {
            console.error('Error saving state to storage:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const savedState = localStorage.getItem('appState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                this.setState({
                    user: parsedState.user || this.state.user,
                    ui: {
                        ...this.state.ui,
                        ...parsedState.ui
                    },
                    edit: parsedState.edit || this.state.edit
                });
            }
        } catch (error) {
            console.error('Error loading state from storage:', error);
        }
    }
    
    // ===== UTILITY METHODS =====
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }
    
    // ===== COMPUTED VALUES =====
    
    getCurrentTeamNotes() {
        return this.state.data.notes[this.state.ui.currentTeam] || [];
    }
    
    getPaginatedMatches() {
        const start = (this.state.ui.currentPage - 1) * 5;
        const end = start + 5;
        return this.state.data.matches.slice(start, end);
    }
    
    getTotalPages() {
        return Math.ceil(this.state.data.matches.length / 5);
    }
    
    isTokenExpired() {
        if (!this.state.user.tokenExpiration) return false;
        return Date.now() > this.state.user.tokenExpiration;
    }
    
    // ===== DATA HANDLERS =====
    
    handleLoadMatches(matches) {
        this.setState({
            data: {
                ...this.state.data,
                matches: matches || []
            }
        });
    }
    
    handleLoadEvents(events) {
        this.setState({
            data: {
                ...this.state.data,
                events: events || []
            }
        });
    }
    
    handleLoadNotes(notes) {
        this.setState({
            data: {
                ...this.state.data,
                notes: notes || {}
            }
        });
    }
    
    handleSetCurrentTeam(team) {
        this.setState({
            ui: {
                ...this.state.ui,
                currentTeam: team
            }
        });
    }
    
    // ===== INITIALIZATION =====
    
    initialize() {
        this.loadFromStorage();
        
        // Load data from storage
        if (window.storage) {
            this.dispatch('LOAD_MATCHES', window.storage.getSavedMatches());
            this.dispatch('LOAD_EVENTS', window.storage.getSavedEvents());
            this.dispatch('LOAD_NOTES', window.storage.getNotes());
        }
        
        // Check if user is still logged in
        if (this.state.user.isLoggedIn && this.isTokenExpired()) {
            this.dispatch('LOGOUT');
        }
    }
}

// Create global instance
window.stateManager = new StateManager();
