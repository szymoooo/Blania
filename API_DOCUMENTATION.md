# 📚 Dokumentacja API - Blania

## Przegląd

Dokumentacja API dla aplikacji Blania - planera statystyk koszykarskich. Zawiera szczegółowe informacje o wszystkich modułach, klasach i funkcjach.

## 📁 Struktura modułów

### 1. **Config.js** - Konfiguracja i stałe
```javascript
// Dostęp do konfiguracji
AppConfig.DATABASE.HOST
AppConfig.UI.RECORDS_PER_PAGE
AppConfig.ERROR_TYPES.NETWORK
```

### 2. **Storage.js** - Zarządzanie danymi
```javascript
// Podstawowe operacje
storage.get(key, defaultValue)
storage.set(key, value)
storage.remove(key)

// Specjalne metody
storage.getSavedMatches()
storage.saveMatch(match)
storage.getTeamNotes(team)
```

### 3. **StateManager.js** - Zarządzanie stanem
```javascript
// Dispatch akcji
stateManager.dispatch('LOGIN', user)
stateManager.dispatch('ADD_MATCH', match)

// Subskrypcja zmian
const unsubscribe = stateManager.subscribe('user', callback)
```

### 4. **ErrorHandler.js** - Obsługa błędów
```javascript
// Obsługa błędów
errorHandler.handleError(error, context)

// Retry mechanism
await errorHandler.retryOperation(operation, context)

// Notyfikacje
errorHandler.showError(message, type, duration)
```

### 5. **Performance.js** - Optymalizacja wydajności
```javascript
// Optymalizacja obrazów
performanceOptimizer.optimizeImages()

// Debounce/Throttle
const debouncedFn = performanceOptimizer.debounce(fn, delay)
const throttledFn = performanceOptimizer.throttle(fn, delay)

// Monitoring
performanceOptimizer.measurePerformance(name, fn)
```

## 🔧 API Reference

### StorageManager

#### `constructor()`
Tworzy nową instancję StorageManager.

#### `get(key, defaultValue)`
Pobiera wartość z localStorage.

**Parametry:**
- `key` (string): Klucz w localStorage
- `defaultValue` (*): Wartość domyślna

**Zwraca:** Wartość z localStorage lub wartość domyślną

#### `set(key, value)`
Zapisuje wartość do localStorage.

**Parametry:**
- `key` (string): Klucz w localStorage
- `value` (*): Wartość do zapisania

**Zwraca:** boolean - true jeśli zapisano pomyślnie

#### `saveMatch(match)`
Zapisuje mecz do localStorage.

**Parametry:**
- `match` (Object): Obiekt meczu z polami:
  - `id` (number): Unikalny identyfikator
  - `team` (string): Nazwa drużyny
  - `date` (string): Data meczu
  - `total` (number): Suma punktów
  - `Asy`, `Blok`, `Zb`, `Prze` (number): Statystyki

**Zwraca:** boolean - true jeśli zapisano pomyślnie

### StateManager

#### `dispatch(action, payload)`
Wysyła akcję do state managera.

**Dostępne akcje:**
- `LOGIN` - Logowanie użytkownika
- `LOGOUT` - Wylogowanie
- `ADD_MATCH` - Dodanie meczu
- `UPDATE_MATCH` - Aktualizacja meczu
- `DELETE_MATCH` - Usunięcie meczu
- `SET_CURRENT_TEAM` - Ustawienie aktualnej drużyny
- `SET_LOADING` - Ustawienie stanu ładowania
- `SET_ERROR` - Ustawienie błędu

#### `subscribe(path, callback)`
Subskrybuje zmiany w określonej części stanu.

**Parametry:**
- `path` (string): Ścieżka do obserwowanej części stanu (np. 'user', 'data.matches')
- `callback` (Function): Funkcja wywoływana przy zmianach

**Zwraca:** Funkcja do anulowania subskrypcji

### ErrorHandler

#### `handleError(error, context)`
Obsługuje błąd i zwraca strategię obsługi.

**Parametry:**
- `error` (Error): Obiekt błędu
- `context` (Object): Kontekst błędu

**Zwraca:** Object z polami:
- `shouldRetry` (boolean): Czy należy ponowić próbę
- `message` (string): Komunikat dla użytkownika
- `action` (string): Akcja do wykonania

#### `retryOperation(operation, context, maxRetries)`
Ponawia operację w przypadku błędu.

**Parametry:**
- `operation` (Function): Funkcja do wykonania
- `context` (Object): Kontekst operacji
- `maxRetries` (number): Maksymalna liczba prób

**Zwraca:** Promise z wynikiem operacji

### PerformanceOptimizer

#### `optimizeImages()`
Optymalizuje obrazy (konwersja do WebP, lazy loading).

#### `debounce(func, delay, key)`
Tworzy funkcję z debounce.

**Parametry:**
- `func` (Function): Funkcja do opóźnienia
- `delay` (number): Opóźnienie w milisekundach
- `key` (string): Klucz do identyfikacji

**Zwraca:** Function - funkcja z debounce

#### `throttle(func, delay, key)`
Tworzy funkcję z throttle.

**Parametry:**
- `func` (Function): Funkcja do ograniczenia
- `delay` (number): Opóźnienie w milisekundach
- `key` (string): Klucz do identyfikacji

**Zwraca:** Function - funkcja z throttle

## 🧪 Testy

### Uruchamianie testów

```javascript
// Uruchom wszystkie testy
const testManager = new TestManager();
await testManager.runAllTests();

// Uruchom konkretne testy
const storageTests = new StorageTests();
await storageTests.run();
```

### Tworzenie nowych testów

```javascript
// Dodaj test do TestRunner
testRunner.addTest('nazwa testu', () => {
    // Kod testu
    Assert.assertEquals(actual, expected);
}, 'grupa testów');
```

## 📊 Monitoring i debugowanie

### Sprawdzanie stanu aplikacji

```javascript
// Stan aplikacji
console.log(stateManager.getState());

// Błędy
console.log(errorHandler.getStoredErrors());

// Metryki wydajności
console.log(performanceOptimizer.getPerformanceMetrics());
```

### Eksport danych

```javascript
// Eksport błędów
errorHandler.exportErrors();

// Eksport metryk
performanceOptimizer.exportMetrics();
```

## 🔒 Bezpieczeństwo

### Walidacja danych

```javascript
// Walidacja po stronie klienta
if (!ValidationConstants.EMAIL_REGEX.test(email)) {
    throw new Error('Nieprawidłowy email');
}

// Walidacja po stronie serwera (PHP)
$errors = validateInput($data);
if (!empty($errors)) {
    sendErrorResponse('Błędy walidacji:', 400, $errors);
}
```

### Sanityzacja

```javascript
// Sanityzacja danych wejściowych
const sanitized = sanitizeInput(userInput);
```

## 🚀 Optymalizacja

### Lazy Loading

```javascript
// Obrazy z lazy loading
<img data-src="image.png" alt="Description">

// Automatycznie obsługiwane przez PerformanceOptimizer
```

### Caching

```javascript
// Cache obrazów
performanceOptimizer.preloadImage('image.png');

// Cache danych
storage.get('cachedData', () => fetchData());
```

## 📝 Przykłady użycia

### Dodawanie nowego meczu

```javascript
const match = {
    id: Date.now(),
    team: 'BAT Sierakowice',
    date: '2024-01-15',
    total: 25,
    '2pkt-celne': 8,
    '2pkt-niecelne': 2,
    '3pkt-celne': 3,
    '3pkt-niecelne': 1,
    '1pkt-celne': 0,
    '1pkt-niecelne': 0,
    Asy: 5,
    Blok: 2,
    Zb: 8,
    Prze: 3,
    streamLink: 'https://youtube.com/watch?v=...'
};

// Zapisz przez storage
storage.saveMatch(match);

// Lub przez state manager
stateManager.dispatch('ADD_MATCH', match);
```

### Obsługa błędów

```javascript
try {
    const result = await riskyOperation();
    return result;
} catch (error) {
    const strategy = errorHandler.handleError(error, { operation: 'riskyOperation' });
    
    if (strategy.shouldRetry) {
        // Ponów operację
        return await retryOperation();
    } else {
        // Pokaż błąd użytkownikowi
        errorHandler.showError(strategy.message);
        throw error;
    }
}
```

### Subskrypcja zmian stanu

```javascript
// Obserwuj zmiany w meczach
const unsubscribe = stateManager.subscribe('data.matches', (matches) => {
    console.log('Nowe mecze:', matches);
    updateUI(matches);
});

// Anuluj subskrypcję
unsubscribe();
```

## 🐛 Rozwiązywanie problemów

### Częste problemy

1. **Błąd "AppConfig is not defined"**
   - Upewnij się, że `config.js` jest załadowany przed innymi skryptami

2. **Testy nie działają**
   - Sprawdź czy wszystkie zależności są załadowane
   - Uruchom testy w konsoli: `testManager.runAllTests()`

3. **Błędy localStorage**
   - Sprawdź czy przeglądarka obsługuje localStorage
   - Sprawdź czy nie przekroczono limitu miejsca

### Debugowanie

```javascript
// Włącz szczegółowe logowanie
localStorage.setItem('debug', 'true');

// Sprawdź stan aplikacji
console.log('App State:', stateManager.getState());
console.log('Storage Keys:', Object.keys(localStorage));
console.log('Performance:', performanceOptimizer.getPerformanceMetrics());
```

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź konsolę deweloperską
2. Uruchom testy jednostkowe
3. Sprawdź dokumentację API
4. Skontaktuj się z zespołem deweloperskim
