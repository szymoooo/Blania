/* ========================================
   CONFIGURATION & CONSTANTS
   Centralne miejsce dla wszystkich stałych i konfiguracji
   ======================================== */

/**
 * Główna konfiguracja aplikacji
 * @namespace AppConfig
 */
const AppConfig = {
    /**
     * Konfiguracja bazy danych
     * @type {Object}
     */
    DATABASE: {
        HOST: 'db4free.net',
        NAME: 'stat_blanka',
        USER: 'blanka_user',
        PASSWORD: 'q5a.ssCr5TmF76L',
        MAX_RETRIES: 3,
        TIMEOUT: 30000
    },

    /**
     * Konfiguracja Google API
     * @type {Object}
     */
    GOOGLE: {
        CLIENT_ID: '148953860327-72d408l9qvt34akmhaa1e37m4bvbto70.apps.googleusercontent.com',
        SCOPE: 'https://www.googleapis.com/auth/calendar.events',
        CALENDAR_SCOPE: 'https://www.googleapis.com/auth/calendar.events'
    },

    /**
     * Konfiguracja UI
     * @type {Object}
     */
    UI: {
        RECORDS_PER_PAGE: 5,
        MAX_RETRY_ATTEMPTS: 3,
        DEBOUNCE_DELAY: 300,
        THROTTLE_DELAY: 100,
        NOTIFICATION_DURATION: 5000,
        MEMORY_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minut
        MAX_IMAGE_CACHE_SIZE: 50,
        MAX_ERROR_STORAGE: 100,
        MAX_PERFORMANCE_METRICS: 100
    },

    /**
     * Konfiguracja walidacji
     * @type {Object}
     */
    VALIDATION: {
        MAX_STATISTICS_VALUE: 1000,
        MIN_STATISTICS_VALUE: 0,
        MAX_POINTS_VALUE: 100,
        MIN_POINTS_VALUE: 0,
        MAX_STRING_LENGTH: 100,
        MAX_NOTE_LENGTH: 1000,
        MAX_EVENT_NAME_LENGTH: 200
    },

    /**
     * Konfiguracja wydajności
     * @type {Object}
     */
    PERFORMANCE: {
        BATCH_SIZE: 5,
        LAZY_LOAD_MARGIN: '50px 0px',
        LAZY_LOAD_THRESHOLD: 0.01,
        REQUEST_TIMEOUT: 10000,
        RETRY_DELAY_BASE: 1000, // Bazowy czas opóźnienia dla retry
        MAX_RETRY_DELAY: 10000  // Maksymalny czas opóźnienia
    },

    /**
     * Konfiguracja kalendarza
     * @type {Object}
     */
    CALENDAR: {
        DAYS_PER_WEEK: 5,
        REPEAT_WEEKS: 8,
        DEFAULT_EVENT_TIME: '10:30',
        DEFAULT_EVENT_DURATION: 60 // minuty
    },

    /**
     * Typy wydarzeń
     * @type {Object}
     */
    EVENT_TYPES: {
        LEAGUE_MATCH: 'mecz-ligowy',
        TRAINING: 'trening',
        PHYSIOTHERAPY: 'fizjoterapeuta',
        FRIENDLY_MATCH: 'mecz-sparingowy',
        TOURNAMENT: 'turniej',
        CAMP: 'oboz',
        BUS: 'bus'
    },

    /**
     * Kolory wydarzeń
     * @type {Object}
     */
    EVENT_COLORS: {
        'mecz-ligowy': '#0078d7',
        'trening': '#28a745',
        'fizjoterapeuta': '#ffc107',
        'mecz-sparingowy': '#dc3545',
        'turniej': '#6f42c1',
        'oboz': '#17a2b8',
        'bus': '#17a2b8'
    },

    /**
     * Ikony wydarzeń
     * @type {Object}
     */
    EVENT_ICONS: {
        'mecz-ligowy': 'match.png',
        'mecz-dom': 'match.png',
        'mecz-wyjazd': 'match.png',
        'trening': 'training.png',
        'fizjoterapeuta': 'physio.png',
        'fizjo': 'physio.png',
        'mecz-sparingowy': 'friendly.png',
        'turniej': 'tournament.png',
        'oboz': 'camp.png',
        'bus': 'bus.png'
    },

    /**
     * Domyślne drużyny
     * @type {Object}
     */
    TEAMS: {
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
    },

    /**
     * Lokalizacje
     * @type {Array<string>}
     */
    LOCATIONS: [
        'Gdynia, ul. Cechowa 22 - SP6',
        'Gdynia, ul. Wiczlińska 50a - Microsoft',
        'Gdynia, ul. Kopernika 34 - Maku',
        'Gdynia, ul. Olimpijska 5/9 - GCS',
        'Sopot, ul. Książąt Pomorskich 16-18',
        'Mecz wyjazdowy',
        'Dom'
    ],

    /**
     * Opcje przypomnień (w minutach)
     * @type {Object}
     */
    REMINDER_OPTIONS: {
        NONE: 0,
        FIVE_MINUTES: 5,
        FIFTEEN_MINUTES: 15,
        THIRTY_MINUTES: 30,
        ONE_HOUR: 60,
        ONE_DAY: 1440
    },

    /**
     * Klucze localStorage
     * @type {Object}
     */
    STORAGE_KEYS: {
        SAVED_MATCHES: 'savedMatches',
        SAVED_EVENTS: 'savedEvents',
        NOTES: 'notes',
        GOOGLE_USER: 'googleUser',
        GOOGLE_ACCESS_TOKEN: 'googleAccessToken',
        CURRENT_TEAM: 'currentTeam',
        SELECTED_TEAM: 'selectedTeam',
        SELECTED_DATE: 'selectedDate',
        EDIT_MATCH_ID: 'editMatchId',
        EDIT_EVENT_ID: 'editEventId',
        CURRENT_NOTE_INDEX: 'currentNoteIndex',
        NOTE_TO_EDIT: 'noteToEdit',
        APP_STATE: 'appState',
        APP_ERRORS: 'appErrors',
        PERFORMANCE_METRICS: 'performanceMetrics'
    },

    /**
     * Typy błędów
     * @type {Object}
     */
    ERROR_TYPES: {
        NETWORK: 'NETWORK_ERROR',
        VALIDATION: 'VALIDATION_ERROR',
        AUTH: 'AUTH_ERROR',
        STORAGE: 'STORAGE_ERROR',
        API: 'API_ERROR',
        UNKNOWN: 'UNKNOWN_ERROR'
    },

    /**
     * Komunikaty błędów
     * @type {Object}
     */
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Problem z połączeniem internetowym',
        VALIDATION_ERROR: 'Nieprawidłowe dane wejściowe',
        AUTH_ERROR: 'Błąd autoryzacji',
        STORAGE_ERROR: 'Błąd zapisu danych',
        API_ERROR: 'Błąd API',
        UNKNOWN_ERROR: 'Nieoczekiwany błąd',
        REQUIRED_FIELD: 'Pole jest wymagane',
        INVALID_EMAIL: 'Podaj prawidłowy adres email',
        INVALID_DATE: 'Podaj prawidłową datę',
        INVALID_NUMBER: 'Podaj prawidłową liczbę',
        VALUE_OUT_OF_RANGE: 'Wartość jest poza dozwolonym zakresem',
        SESSION_EXPIRED: 'Sesja wygasła. Zaloguj się ponownie',
        STORAGE_NOT_SUPPORTED: 'Błąd zapisu danych. Sprawdź czy przeglądarka obsługuje localStorage',
        SERVER_ERROR: 'Błąd serwera. Spróbuj ponownie za chwilę',
        UNEXPECTED_ERROR: 'Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę'
    }
};

/**
 * Stałe matematyczne i obliczeniowe
 * @namespace MathConstants
 */
const MathConstants = {
    /** Mnożnik dla exponential backoff */
    EXPONENTIAL_BACKOFF_BASE: 2,
    
    /** Maksymalny współczynnik retry */
    MAX_RETRY_MULTIPLIER: 10,
    
    /** Mnożnik dla konwersji minut na milisekundy */
    MINUTES_TO_MS: 60 * 1000,
    
    /** Mnożnik dla konwersji godzin na milisekundy */
    HOURS_TO_MS: 60 * 60 * 1000,
    
    /** Mnożnik dla konwersji dni na milisekundy */
    DAYS_TO_MS: 24 * 60 * 60 * 1000,
    
    /** Liczba milisekund w tygodniu */
    WEEK_MS: 7 * 24 * 60 * 60 * 1000
};

/**
 * Stałe dla walidacji formularzy
 * @namespace ValidationConstants
 */
const ValidationConstants = {
    /** Minimalna długość hasła */
    MIN_PASSWORD_LENGTH: 8,
    
    /** Maksymalna długość nazwy użytkownika */
    MAX_USERNAME_LENGTH: 50,
    
    /** Wzorzec dla adresu email */
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    
    /** Wzorzec dla numeru telefonu */
    PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
    
    /** Maksymalna długość komentarza */
    MAX_COMMENT_LENGTH: 500
};

// Eksportuj konfigurację do globalnego scope
window.AppConfig = AppConfig;
window.MathConstants = MathConstants;
window.ValidationConstants = ValidationConstants;
