// Stałe i zmienne globalne
const logos = {
    'BAT Sierakowice': 'BAT Sierakowice.png',
    'BAT Kartuzy': 'BAT Kartuzy.png',
    'Bryza Pruszcz Gd': 'Bryza Pruszcz Gd.png',
    'Elbląg': 'Elblag.png',
    'Pruszcz Gdański 1': 'Pruszcz Gdanski 1.png',
    'Pruszcz Gdański 2': 'Pruszcz Gdanski 2.png',
    'BK VLCI Žďár': 'BK VLCI Zdar.png',
    'BKM Žilina': 'BKM Zilina.png',
    'MOSiR Bochnia': 'MOSiR Bochnia.png',
    'UKS ŻAK Nowy Sącz': 'UKS ZAK Nowy Sacz.png',
    'Young Angels Košice': 'Young Angels Kosice.png'
};

let currentWeekStart = new Date();
let notes = JSON.parse(localStorage.getItem('notes')) || {};
let currentTeam = 'BAT Sierakowice';
let currentNoteIndex = 0;
let currentPage = 1;
const recordsPerPage = 5;
let googleAuthInitialized = false;

// Funkcje pomocnicze
function safeJsonParse(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Błąd parsowania JSON:', e);
        return null;
    }
}

function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return safeJsonParse(atob(base64));
    } catch (e) {
        console.error('Błąd dekodowania JWT:', e);
        return null;
    }
}

function handleAuthError(error) {
    console.error('Błąd autoryzacji:', error);
    alert('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
}

// Logika Google Auth
window.handleGoogleAuth = function(response) {
    if (response.error) {
        handleAuthError(response.error);
        return;
    }
    
    const user = decodeJwt(response.credential);
    if (!user) {
        handleAuthError('invalid_token');
        return;
    }
    
    localStorage.setItem('googleUser', JSON.stringify(user));
    updateUserUI(user);
    authorize().catch(handleAuthError);
};

async function initializeGoogleAuth() {
    return new Promise((resolve) => {
        const checkGoogle = () => {
            if (window.google?.accounts?.id) {
                google.accounts.id.initialize({
                    client_id: '148953860327-72d408l9qvt34akmhaa1e37m4bvbto70.apps.googleusercontent.com',
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
    localStorage.removeItem('googleUser');
    localStorage.removeItem('googleAccessToken');
    updateUserUI(null);
}

async function authorize() {
    return new Promise((resolve, reject) => {
        if (!window.google?.accounts?.oauth2) {
            reject(new Error("Google API nie zostało załadowane"));
            return;
        }

        const client = google.accounts.oauth2.initTokenClient({
            client_id: '148953860327-72d408l9qvt34akmhaa1e37m4bvbto70.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/calendar.events',
            prompt: 'consent',
            callback: (response) => {
                if (response.access_token) {
                    localStorage.setItem('googleAccessToken', response.access_token);
                    resolve(response.access_token);
                } else {
                    reject(response.error || 'unknown_error');
                }
            },
        });
        client.requestAccessToken();
    });
}

// Logika drużyn i notatek
function changeLogo() {
    const teamSelector = document.getElementById('team-selector');
    const logo = document.getElementById('team-logo');
    logo.src = logos[teamSelector.value] || 'BAT Sierakowice.png';
    currentTeam = teamSelector.value;
    localStorage.setItem('currentTeam', currentTeam);
    loadNotes();
    updateNotesNavigation();
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('game-date').value = today;
}

function startGame() {
    const team = document.getElementById('team-selector').value;
    const date = document.getElementById('game-date').value;

    if (!date) {
        alert("Proszę wybrać datę meczu!");
        return;
    }

    localStorage.setItem("selectedTeam", team);
    localStorage.setItem("selectedDate", date);
    localStorage.removeItem("editMatchId");
    window.location.href = "blania.html";
}

function loadNotes() {
    const notesDisplay = document.getElementById('notes-display');
    const teamNotes = notes[currentTeam] || [];

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
    const teamNotes = notes[currentTeam] || [];
    const notesNavigation = document.getElementById('notes-navigation');
    const buttons = notesNavigation.querySelectorAll('button');
    
    buttons[0].classList.toggle('display-inline-block', teamNotes.length >= 2);
    buttons[1].classList.toggle('display-inline-block', teamNotes.length > 0);
    buttons[3].classList.toggle('display-inline-block', teamNotes.length >= 2);
}

function prevNote() {
    if (currentNoteIndex > 0) {
        currentNoteIndex--;
        loadNotes();
    }
}

function nextNote() {
    if (currentNoteIndex < notes[currentTeam].length - 1) {
        currentNoteIndex++;
        loadNotes();
    }
}

function openNotesForm() {
    localStorage.setItem('currentTeam', currentTeam);
    localStorage.removeItem('currentNoteIndex');
    window.location.href = 'notes-form.html';
}

function editNote() {
    const teamNotes = notes[currentTeam] || [];
    if (teamNotes.length > 0) {
        const note = teamNotes[currentNoteIndex];
        localStorage.setItem('currentTeam', currentTeam);
        localStorage.setItem('currentNoteIndex', currentNoteIndex);
        localStorage.setItem('noteToEdit', JSON.stringify(note));
        window.location.href = 'notes-form.html';
    }
}

// Logika kalendarza
function moveCalendar(days) {
    currentWeekStart.setDate(currentWeekStart.getDate() + (days * 5));
    generateCalendar();
}

function generateCalendar() {
    const calendarWeek = document.querySelector('.calendar-week');
    calendarWeek.innerHTML = "";

    for (let i = 0; i < 5; i++) {
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

        const savedEvents = safeJsonParse(localStorage.getItem('savedEvents')) || [];
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
    const savedEvents = safeJsonParse(localStorage.getItem('savedEvents')) || [];
    const eventIcons = {
        'mecz-ligowy': 'match.png',
        'trening': 'training.png',
        'fizjoterapeuta': 'physio.png',
        'mecz-sparingowy': 'friendly.png',
        'turniej': 'tournament.png',
        'oboz': 'camp.png',
        'bus': 'bus.png'
    };

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
    const savedEvents = safeJsonParse(localStorage.getItem('savedEvents')) || [];
    const eventToEdit = savedEvents.find(event => event.id === eventId);

    if (eventToEdit) {
        localStorage.setItem("selectedDate", eventToEdit.date.split('T')[0]);
        localStorage.setItem("editEventId", eventToEdit.id);
        window.location.href = "add-event.html";
    } else {
        alert("Event nie został znaleziony.");
    }
}

function addEvent() {
    if (!checkLoginStatus()) {
        alert("Proszę zalogować się przez Google przed dodaniem wydarzenia");
        return;
    }
    
    const selectedDate = new Date(currentWeekStart).toISOString().split('T')[0];
    localStorage.setItem("selectedDate", selectedDate);
    window.location.href = "add-event.html";
}

// Logika statystyk
function loadSavedMatches() {
    const tableBody = document.querySelector("#matches-table tbody");
    let savedMatches = safeJsonParse(localStorage.getItem("savedMatches")) || [];

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
                savedMatches = savedMatches.filter(m => m.id !== match.id);
                localStorage.setItem("savedMatches", JSON.stringify(savedMatches));
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
    const savedMatches = safeJsonParse(localStorage.getItem("savedMatches")) || [];
    const matchToEdit = savedMatches.find(match => match.id === matchId);

    if (matchToEdit) {
        localStorage.setItem("selectedTeam", matchToEdit.team);
        localStorage.setItem("selectedDate", matchToEdit.date);
        localStorage.setItem("editMatchId", matchToEdit.id);
        window.location.href = "blania.html";
    } else {
        alert("Mecz nie został znaleziony.");
    }
}

// Funkcje pomocnicze
function checkLoginStatus() {
    const user = safeJsonParse(localStorage.getItem('googleUser'));
    if (!user) return false;
    
    const tokenExpiration = user.exp * 1000;
    if (Date.now() > tokenExpiration) {
        localStorage.removeItem('googleUser');
        localStorage.removeItem('googleAccessToken');
        return false;
    }
    return true;
}

async function addEventToGoogleCalendar(event) {
    try {
        if (!checkLoginStatus()) {
            throw new Error("Proszę zalogować się przez Google");
        }

        let accessToken = localStorage.getItem('googleAccessToken');
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
                localStorage.removeItem('googleAccessToken');
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

// Inicjalizacja aplikacji
async function initializeApp() {
    await initializeGoogleAuth();
    
    const user = JSON.parse(localStorage.getItem('googleUser'));
    updateUserUI(user);

    setTodayDate();
    
    const savedTeam = localStorage.getItem('currentTeam');
    if (savedTeam) {
        currentTeam = savedTeam;
        document.getElementById('team-selector').value = currentTeam;
        changeLogo();
    } else {
        changeLogo();
    }

    generateCalendar();
    loadSavedMatches();
    loadNotes();

    // Event listeners
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('team-selector').addEventListener('change', changeLogo);
    document.querySelector('.btn-prev-calendar').addEventListener('click', () => moveCalendar(-1));
    document.querySelector('.btn-next-calendar').addEventListener('click', () => moveCalendar(1));
    document.querySelector('.btn-add-event').addEventListener('click', addEvent);
    document.querySelector('.btn-start-game').addEventListener('click', startGame);
    document.querySelector('.btn-prev-note').addEventListener('click', prevNote);
    document.querySelector('.btn-next-note').addEventListener('click', nextNote);
    document.querySelector('.btn-add-note').addEventListener('click', openNotesForm);
    document.querySelector('.btn-edit-note').addEventListener('click', editNote);
    document.getElementById('prev-btn').addEventListener('click', () => changePage(-1));
    document.getElementById('next-btn').addEventListener('click', () => changePage(1));
}

// Start aplikacji
document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(error => {
        console.error('Błąd inicjalizacji aplikacji:', error);
    });
});
