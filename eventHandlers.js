/* ========================================
   EVENT HANDLERS MODULE
   Scentralizowana obsługa event listenerów
   ======================================== */

class EventHandlerManager {
    constructor() {
        this.handlers = new Map();
    }

    // Dodaj event listener
    add(element, event, handler, options = {}) {
        if (!element) return;
        
        const key = `${element.id || element.className || 'unknown'}_${event}`;
        this.handlers.set(key, { element, event, handler, options });
        element.addEventListener(event, handler, options);
    }

    // Usuń event listener
    remove(element, event) {
        const key = `${element.id || element.className || 'unknown'}_${event}`;
        const handlerData = this.handlers.get(key);
        if (handlerData) {
            element.removeEventListener(event, handlerData.handler, handlerData.options);
            this.handlers.delete(key);
        }
    }

    // Usuń wszystkie handlery
    removeAll() {
        this.handlers.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.handlers.clear();
    }

    // ===== SPECJALNE HANDLERY DLA APLIKACJI =====

    // Inicjalizuj wszystkie handlery dla main.html
    initMainHandlers() {
        // Google Auth
        this.add(document.getElementById('logout-btn'), 'click', logout);
        
        // Team selection
        this.add(document.getElementById('team-selector'), 'change', changeLogo);
        
        // Calendar navigation
        this.add(document.querySelector('.btn-prev-calendar'), 'click', () => moveCalendar(-1));
        this.add(document.querySelector('.btn-next-calendar'), 'click', () => moveCalendar(1));
        this.add(document.querySelector('.btn-add-event'), 'click', addEvent);
        
        // Game start
        this.add(document.querySelector('.btn-start-game'), 'click', startGame);
        
        // Notes navigation
        this.add(document.querySelector('.btn-prev-note'), 'click', prevNote);
        this.add(document.querySelector('.btn-next-note'), 'click', nextNote);
        this.add(document.querySelector('.btn-add-note'), 'click', openNotesForm);
        this.add(document.querySelector('.btn-edit-note'), 'click', editNote);
        
        // Stats pagination
        this.add(document.getElementById('prev-btn'), 'click', () => changePage(-1));
        this.add(document.getElementById('next-btn'), 'click', () => changePage(1));
    }

    // Inicjalizuj handlery dla blania.html
    initStatsHandlers() {
        // Counter buttons - dodane dynamicznie w HTML
        // saveMatch jest wywoływane przez onclick w HTML
    }

    // Inicjalizuj handlery dla add-event.html
    initEventFormHandlers() {
        const form = document.getElementById('event-form');
        if (form) {
            this.add(form, 'submit', handleEventFormSubmit);
        }
        
        this.add(document.getElementById('event-type'), 'change', handleEventTypeChange);
        this.add(document.getElementById('event-date'), 'change', setDefaultTime);
    }

    // Inicjalizuj handlery dla notes-form.html
    initNotesFormHandlers() {
        this.add(document.querySelector('.primary-btn[onclick="saveNote()"]'), 'click', saveNote);
        this.add(document.querySelector('.primary-btn[onclick="closeNotesForm()"]'), 'click', closeNotesForm);
        
        // Rating stars
        document.querySelectorAll('.rating span').forEach((star, index) => {
            this.add(star, 'click', () => setRating(index + 1));
        });
    }
}

// ===== HANDLERY FORMULARZY =====

function handleEventFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const event = {
        id: storage.getEditEventId() || Date.now(),
        name: formData.get('event-name').trim(),
        date: formData.get('event-date') + 'T' + formData.get('event-time'),
        location: formData.get('event-location'),
        repeat: formData.get('event-repeat') === 'on',
        notes: formData.get('event-notes').trim(),
        reminder: formData.get('event-reminder'),
        type: formData.get('event-type'),
        color: getEventColor(formData.get('event-type'))
    };

    // Walidacja
    if (!event.name) {
        alert("Proszę podać nazwę wydarzenia.");
        return;
    }
    if (!formData.get('event-date')) {
        alert("Proszę wybrać datę wydarzenia.");
        return;
    }
    if (!formData.get('event-time')) {
        alert("Proszę wybrać godzinę wydarzenia.");
        return;
    }
    if (!event.location) {
        alert("Proszę wybrać lokalizację wydarzenia.");
        return;
    }

    // Zapisz wydarzenie
    if (storage.saveEvent(event)) {
        // Jeśli powtarzanie, dodaj kolejne tygodnie
        if (event.repeat) {
            addRepeatedEvents(event);
        }
        
        storage.clearEditData();
        window.location.href = 'main.html';
    } else {
        alert("Błąd podczas zapisywania wydarzenia.");
    }
}

function addRepeatedEvents(event) {
    const repeatWeeks = 8;
    for (let i = 1; i <= repeatWeeks; i++) {
        const newEventDate = new Date(event.date);
        newEventDate.setDate(newEventDate.getDate() + 7 * i);
        
        const repeatedEvent = {
            ...event,
            id: Date.now() + i,
            date: newEventDate.toISOString().split('T')[0] + 'T' + event.date.split('T')[1]
        };
        
        storage.saveEvent(repeatedEvent);
    }
}

function getEventColor(type) {
    const colors = {
        'mecz-ligowy': '#0078d7',
        'trening': '#28a745',
        'fizjoterapeuta': '#ffc107',
        'mecz-sparingowy': '#dc3545',
        'turniej': '#6f42c1',
        'oboz': '#17a2b8',
        'bus': '#17a2b8'
    };
    return colors[type] || '#0078d7';
}

function handleEventTypeChange() {
    const eventType = document.getElementById('event-type').value;
    const teamSelector = document.getElementById('team-selector');
    const eventNameInput = document.getElementById('event-name');

    if (eventType === 'mecz-ligowy' || eventType === 'mecz-sparingowy') {
        teamSelector.style.display = 'block';
        eventNameInput.style.display = 'none';
        updateEventName();
    } else {
        teamSelector.style.display = 'none';
        eventNameInput.style.display = 'block';
    }
}

function updateEventName() {
    const teamSelector = document.getElementById('team-selector');
    const eventNameInput = document.getElementById('event-name');
    eventNameInput.value = teamSelector.value;
}

function setDefaultTime() {
    const eventTime = document.getElementById('event-time');
    if (!eventTime.value) {
        eventTime.value = '10:30';
    }
}

// ===== HANDLERY NOTATEK =====

function saveNote() {
    const note = {
        strengths: document.getElementById('notes-strengths').value,
        weaknesses: document.getElementById('notes-weaknesses').value,
        focus: document.getElementById('notes-focus').value,
        star: document.getElementById('notes-star').value,
        defender: document.getElementById('notes-defender').value,
        other: document.getElementById('notes-other').value,
        rating: document.querySelectorAll('.rating span.active').length
    };

    const team = storage.getCurrentTeam();
    const noteIndex = storage.getCurrentNoteIndex();
    
    if (storage.saveTeamNote(team, note, noteIndex)) {
        storage.clearEditData();
        window.location.href = 'main.html';
    } else {
        alert("Błąd podczas zapisywania notatki.");
    }
}

function closeNotesForm() {
    storage.clearEditData();
    window.location.href = 'main.html';
}

function setRating(rating) {
    document.querySelectorAll('.rating span').forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

// Utwórz globalną instancję
window.eventHandlers = new EventHandlerManager();
