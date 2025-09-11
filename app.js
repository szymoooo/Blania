/* ========================================
   BLANIA - GŁÓWNA APLIKACJA
   Refaktoryzowana wersja bez duplikatów
   ======================================== */

// Stałe i zmienne globalne
const logos = AppConfig.TEAMS;

let currentWeekStart = new Date();
let currentTeam = 'BAT Sierakowice';
let currentNoteIndex = 0;
let currentPage = 1;
const recordsPerPage = AppConfig.UI.RECORDS_PER_PAGE;
let googleAuthInitialized = false;

// ===== GOOGLE AUTH FUNCTIONS =====

function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return storage.safeJsonParse(atob(base64));
    } catch (e) {
        console.error('Błąd dekodowania JWT:', e);
        return null;
    }
}

function handleAuthError(error) {
    console.error('Błąd autoryzacji:', error);
    alert('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
}

window.handleGoogleAuth = function(response) {
    console.log('handleGoogleAuth called with:', response);
    
    if (response.error) {
        console.error('Google Auth error:', response.error);
        handleAuthError(response.error);
        return;
    }
    
    const user = decodeJwt(response.credential);
    if (!user) {
        console.error('Failed to decode JWT');
        handleAuthError('invalid_token');
        return;
    }
    
    console.log('Google Auth successful, user:', user);
    storage.setGoogleUser(user);
    updateUserUI(user);
    authorize().catch(handleAuthError);
};

async function initializeGoogleAuth() {
    return new Promise((resolve) => {
        const checkGoogle = () => {
            if (window.google?.accounts?.id) {
        google.accounts.id.initialize({
            client_id: AppConfig.GOOGLE.CLIENT_ID,
            callback: window.handleCredentialResponse
        });
                googleAuthInitialized = true;
                resolve(true);
            } else {
                setTimeout(checkGoogle, 100);
            }
        };
        checkGoogle();
    });
}

function renderGoogleButton() {
    if (!googleAuthInitialized) return;
    
    const buttonContainer = document.getElementById('google-login-button');
    if (!buttonContainer) return;

    buttonContainer.innerHTML = '';
    
    google.accounts.id.renderButton(
        buttonContainer,
        {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 300
        }
    );
}

function updateUserUI(user) {
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const loginButton = document.getElementById('google-login-button');

    if (user) {
        userName.textContent = user.name || user.email;
        userInfo.classList.remove('display-none');
        userInfo.classList.add('display-block');
        loginButton.classList.add('display-none');
    } else {
        userInfo.classList.add('display-none');
        userInfo.classList.remove('display-block');
        loginButton.classList.remove('display-none');
        renderGoogleButton();
    }
}

function logout() {
    if (window.google && window.google.accounts) {
        google.accounts.id.disableAutoSelect();
    }
    storage.clearGoogleAuth();
    updateUserUI(null);
}

async function authorize() {
    return new Promise((resolve, reject) => {
        if (!window.google?.accounts?.oauth2) {
            reject(new Error("Google API nie zostało załadowane"));
            return;
        }

        const client = google.accounts.oauth2.initTokenClient({
            client_id: AppConfig.GOOGLE.CLIENT_ID,
            scope: AppConfig.GOOGLE.SCOPE,
            prompt: 'consent',
            callback: (response) => {
                if (response.access_token) {
                    storage.setGoogleAccessToken(response.access_token);
                    resolve(response.access_token);
                } else {
                    reject(response.error || 'unknown_error');
                }
            },
        });
        client.requestAccessToken();
    });
}

// ===== TEAM AND NOTES FUNCTIONS =====

function changeLogo() {
    const teamSelector = document.getElementById('team-selector');
    const logo = document.getElementById('team-logo');
    logo.src = logos[teamSelector.value] || 'BAT Sierakowice.png';
    currentTeam = teamSelector.value;
    storage.setCurrentTeam(currentTeam);
    loadNotes();
    updateNotesNavigation();
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('game-date').value = today;
}

function startGame() {
    console.log('🎮 Przycisk "Gramy" został kliknięty!');
    const team = document.getElementById('team-selector').value;
    const date = document.getElementById('game-date').value;

    console.log('Zespół:', team, 'Data:', date);

    if (!date) {
        alert("Proszę wybrać datę meczu!");
        return;
    }

    storage.setSelectedTeam(team);
    storage.setSelectedDate(date);
    storage.remove(storage.keys.EDIT_MATCH_ID);
    window.location.href = "blania.html";
}

function loadNotes() {
    const notesDisplay = document.getElementById('notes-display');
    const teamNotes = storage.getTeamNotes(currentTeam);

    if (teamNotes.length === 0) {
        notesDisplay.innerHTML = '<p>Tutaj dodaj swoje spostrzeżenia na temat przeciwnika. Kliknij "Dodaj".</p>';
    } else {
        const note = teamNotes[currentNoteIndex];
        notesDisplay.innerHTML = `
            <p><strong>Mocne strony:</strong> ${note.strengths}</p>
            <p><strong>Słabe strony:</strong> ${note.weaknesses}</p>
            <p><strong>Na co zwrócić uwagę:</strong> ${note.focus}</p>
            <p><strong>Gwiazda:</strong> ${note.star}</p>
            <p><strong>Kto mnie krył:</strong> ${note.defender}</p>
            <p><strong>Inne:</strong> ${note.other}</p>
            <p><strong>Ocena:</strong> ${'★'.repeat(note.rating)}</p>
        `;
    }
    updateNotesNavigation();
}

function updateNotesNavigation() {
    const teamNotes = storage.getTeamNotes(currentTeam);
    const notesNavigation = document.getElementById('notes-navigation');
    const buttons = notesNavigation.querySelectorAll('button');
    
    buttons[0].classList.toggle('display-inline-block', teamNotes.length >= 2);
    buttons[1].classList.toggle('display-inline-block', teamNotes.length > 0);
    buttons[3].classList.toggle('display-inline-block', teamNotes.length >= 2);
}

function prevNote() {
    console.log('⬅️ Przycisk "Poprzednia" notatka został kliknięty!');
    console.log('Aktualny indeks:', currentNoteIndex);
    if (currentNoteIndex > 0) {
        currentNoteIndex--;
        console.log('Nowy indeks:', currentNoteIndex);
        loadNotes();
    } else {
        console.log('❌ Już jesteś na pierwszej notatce');
    }
}

function nextNote() {
    console.log('➡️ Przycisk "Następna" notatka został kliknięty!');
    const teamNotes = storage.getTeamNotes(currentTeam);
    console.log('Aktualny indeks:', currentNoteIndex, 'Liczba notatek:', teamNotes.length);
    if (currentNoteIndex < teamNotes.length - 1) {
        currentNoteIndex++;
        console.log('Nowy indeks:', currentNoteIndex);
        loadNotes();
    } else {
        console.log('❌ Już jesteś na ostatniej notatce');
    }
}

function openNotesForm() {
    console.log('📝 Przycisk "Dodaj" notatkę został kliknięty!');
    console.log('Aktualny zespół:', currentTeam);
    storage.setCurrentTeam(currentTeam);
    storage.remove(storage.keys.CURRENT_NOTE_INDEX);
    window.location.href = 'notes-form.html';
}

function editNote() {
    console.log('✏️ Przycisk "Edytuj" notatkę został kliknięty!');
    const teamNotes = storage.getTeamNotes(currentTeam);
    console.log('Liczba notatek dla zespołu', currentTeam, ':', teamNotes.length);
    console.log('Aktualny indeks notatki:', currentNoteIndex);
    
    if (teamNotes.length > 0) {
        const note = teamNotes[currentNoteIndex];
        console.log('Edytowana notatka:', note);
        storage.setCurrentTeam(currentTeam);
        storage.setCurrentNoteIndex(currentNoteIndex);
        storage.setNoteToEdit(note);
        window.location.href = 'notes-form.html';
    } else {
        console.log('❌ Brak notatek do edycji');
    }
}

// ===== CALENDAR FUNCTIONS =====

function moveCalendar(days) {
    console.log('📅 Nawigacja kalendarza:', days > 0 ? 'Następna' : 'Poprzednia', 'tydzień');
    console.log('Aktualna data początku tygodnia:', currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() + (days * AppConfig.CALENDAR.DAYS_PER_WEEK));
    console.log('Nowa data początku tygodnia:', currentWeekStart);
    generateCalendar();
}

function generateCalendar() {
    const calendarWeek = document.querySelector('.calendar-week');
    calendarWeek.innerHTML = "";

    for (let i = 0; i < AppConfig.CALENDAR.DAYS_PER_WEEK; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(currentWeekStart.getDate() + i);

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (day < new Date()) dayElement.classList.add('past');
        if (day.toDateString() === new Date().toDateString()) dayElement.classList.add('current');

        const options = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = new Intl.DateTimeFormat('pl-PL', options).format(day);
        const dayHeader = document.createElement('h3');
        dayHeader.textContent = formattedDate.replace('.', '');
        dayHeader.setAttribute('data-date', day.toISOString().split('T')[0]);
        dayElement.appendChild(dayHeader);

        const eventsList = document.createElement('div');
        eventsList.className = 'events-container';
        dayElement.appendChild(eventsList);

        const savedEvents = storage.getSavedEvents();
        const hasEvents = savedEvents.some(event => {
            const eventDate = new Date(event.date).toISOString().split('T')[0];
            return eventDate === day.toISOString().split('T')[0];
        });

        if (!hasEvents) {
            const noEventsText = document.createElement('p');
            noEventsText.textContent = "Dziś regeneracja? Jeśli masz jakiś plan, kliknij '+ Dodaj wydarzenie'.";
            noEventsText.style.fontStyle = 'italic';
            noEventsText.style.color = '#666';
            eventsList.appendChild(noEventsText);
        }
        calendarWeek.appendChild(dayElement);
    }
    loadEvents();
}

function loadEvents() {
    const savedEvents = storage.getSavedEvents();
    const eventIcons = AppConfig.EVENT_ICONS;

    savedEvents.forEach(event => {
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        document.querySelectorAll('.calendar-day').forEach(dayElement => {
            const dayDate = new Date(dayElement.querySelector('h3').getAttribute('data-date')).toISOString().split('T')[0];
            if (dayDate === eventDate) {
                const eventItem = document.createElement('div');
                eventItem.className = 'event-item';
                eventItem.setAttribute('data-event-id', event.id);

                eventItem.addEventListener('click', () => editEvent(event.id));

                const icon = document.createElement('div');
                icon.className = 'event-icon';
                icon.style.backgroundImage = `url(${eventIcons[event.type]})`;
                icon.style.backgroundSize = 'cover';
                eventItem.appendChild(icon);

                const text = document.createElement('div');
                text.className = 'event-text';
                text.innerHTML = `
                    <strong>${event.date.split('T')[1].substring(0, 5)} ${event.name.substring(0, 20)}${event.name.length > 20 ? '...' : ''}</strong><br>
                    ${event.name.length > 20 ? `<small>${event.name.substring(20)}</small>` : ''}
                    <small>${event.location}</small>
                `;
                eventItem.appendChild(text);

                dayElement.querySelector('.events-container').appendChild(eventItem);
            }
        });
    });
}

function editEvent(eventId) {
    const savedEvents = storage.getSavedEvents();
    const eventToEdit = savedEvents.find(event => event.id === eventId);

    if (eventToEdit) {
        storage.setSelectedDate(eventToEdit.date.split('T')[0]);
        storage.setEditEventId(eventToEdit.id);
        window.location.href = "add-event.html";
    } else {
        alert("Event nie został znaleziony.");
    }
}

function addEvent() {
    console.log('📅 Przycisk "Dodaj wydarzenie" został kliknięty!');
    if (!checkLoginStatus()) {
        console.log('❌ Użytkownik nie jest zalogowany');
        alert("Proszę zalogować się przez Google przed dodaniem wydarzenia");
        return;
    }
    console.log('✅ Użytkownik jest zalogowany, przekierowuję do add-event.html');
    
    const selectedDate = new Date(currentWeekStart).toISOString().split('T')[0];
    storage.setSelectedDate(selectedDate);
    window.location.href = "add-event.html";
}

// ===== STATS FUNCTIONS =====

function loadSavedMatches() {
    const tableBody = document.querySelector("#matches-table tbody");
    let savedMatches = storage.getSavedMatches();

    savedMatches.sort((a, b) => new Date(b.date) - new Date(a.date));

    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const paginatedMatches = savedMatches.slice(start, end);

    tableBody.innerHTML = "";
    paginatedMatches.forEach((match) => {
        const row = document.createElement("tr");
        ["team", "date", "total", "Asy", "Blok", "Zb", "Prze"].forEach(stat => {
            const cell = document.createElement("td");
            cell.textContent = match[stat] || 0;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const actionContainer = document.createElement("div");
        actionContainer.className = "action-container";

        const editButton = document.createElement("button");
        editButton.innerHTML = '<img src="edit.png" alt="Edytuj" class="action-icon">';
        editButton.className = "action-btn edit-btn";
        editButton.addEventListener('click', () => editMatch(match.id));
        actionContainer.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<img src="trash.png" alt="Usuń" class="action-icon">';
        deleteButton.className = "action-btn delete-btn";
        deleteButton.addEventListener('click', () => {
            if (confirm("Czy na pewno chcesz usunąć ten mecz?")) {
                storage.deleteMatch(match.id);
                loadSavedMatches();
            }
        });
        actionContainer.appendChild(deleteButton);

        if (match.streamLink?.trim()) {
            const youtubeButton = document.createElement("button");
            youtubeButton.innerHTML = '<img src="youtube.png" alt="YouTube" class="action-icon">';
            youtubeButton.className = "action-btn yt-btn";
            youtubeButton.addEventListener('click', () => window.open(match.streamLink, "_blank"));
            actionContainer.appendChild(youtubeButton);
        }

        actionCell.appendChild(actionContainer);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });

    document.getElementById("pagination").style.display = savedMatches.length > recordsPerPage ? 'flex' : 'none';
    document.getElementById("prev-btn").disabled = currentPage === 1;
    document.getElementById("next-btn").disabled = currentPage * recordsPerPage >= savedMatches.length;
}

function changePage(direction) {
    currentPage += direction;
    loadSavedMatches();
}

function editMatch(matchId) {
    const savedMatches = storage.getSavedMatches();
    const matchToEdit = savedMatches.find(match => match.id === matchId);

    if (matchToEdit) {
        storage.setSelectedTeam(matchToEdit.team);
        storage.setSelectedDate(matchToEdit.date);
        storage.setEditMatchId(matchToEdit.id);
        window.location.href = "blania.html";
    } else {
        alert("Mecz nie został znaleziony.");
    }
}

// ===== HELPER FUNCTIONS =====

function checkLoginStatus() {
    const user = storage.getGoogleUser();
    if (!user) return false;
    
    const tokenExpiration = user.exp * 1000;
    if (Date.now() > tokenExpiration) {
        storage.clearGoogleAuth();
        return false;
    }
    return true;
}

async function addEventToGoogleCalendar(event) {
    try {
        if (!checkLoginStatus()) {
            throw new Error("Proszę zalogować się przez Google");
        }

        let accessToken = storage.getGoogleAccessToken();
        if (!accessToken) {
            accessToken = await authorize();
        }

        const startDate = new Date(event.date);
        if (isNaN(startDate.getTime())) {
            throw new Error("Nieprawidłowy format daty");
        }

        const endDate = new Date(startDate.getTime() + (event.duration || 60) * 60 * 1000);

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                summary: event.name,
                location: event.location || '',
                description: event.notes || '',
                start: { dateTime: startDate.toISOString(), timeZone: 'Europe/Warsaw' },
                end: { dateTime: endDate.toISOString(), timeZone: 'Europe/Warsaw' },
                reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: event.reminder || 30 }] }
            }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                storage.remove(storage.keys.GOOGLE_ACCESS_TOKEN);
                return addEventToGoogleCalendar(event);
            }
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Błąd podczas dodawania wydarzenia");
        }

        return await response.json();
    } catch (error) {
        console.error("Błąd:", error);
        throw error;
    }
}

// ===== INITIALIZATION =====

async function initializeApp() {
    try {
        // Initialize state manager
        if (window.stateManager) {
            window.stateManager.initialize();
        }
        
        // Initialize error handling
        if (window.errorHandler) {
            window.errorHandler.setupGlobalErrorHandling();
        }
        
        // Initialize performance optimization
        if (window.performanceOptimizer) {
            window.performanceOptimizer.initialize();
        }
        
        await initializeGoogleAuth();
        
        const user = storage.getGoogleUser();
        if (user && window.stateManager) {
            window.stateManager.dispatch('LOGIN', user);
        }
        updateUserUI(user);

        setTodayDate();
        
        const savedTeam = storage.getCurrentTeam();
        if (savedTeam) {
            currentTeam = savedTeam;
            if (window.stateManager) {
                window.stateManager.dispatch('SET_CURRENT_TEAM', savedTeam);
            }
            document.getElementById('team-selector').value = currentTeam;
            changeLogo();
        } else {
            changeLogo();
        }

        generateCalendar();
        loadSavedMatches();
        loadNotes();

        // Inicjalizuj handlery
        if (window.eventHandlers) {
            eventHandlers.initMainHandlers();
        }
        
    } catch (error) {
        if (window.errorHandler) {
            window.errorHandler.handleError(error, { context: 'app_initialization' });
        } else {
            console.error('App initialization error:', error);
        }
    }
}

// Start aplikacji
document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(error => {
        console.error('Błąd inicjalizacji aplikacji:', error);
    });
});
