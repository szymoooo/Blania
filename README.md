# Blania - Planer statystyk koszykarskich

## 🏀 Opis projektu

Aplikacja do zarządzania statystykami meczów koszykarskich, planowania wydarzeń i notatek o przeciwnikach. Zoptymalizowana wersja z zaawansowanym zarządzaniem stanem, obsługą błędów i optymalizacją wydajności.

## ✨ Funkcjonalności

- **Statystyki meczów**: Śledzenie punktów, asyst, bloków, zbiórek i przechwytów
- **Planer wydarzeń**: Kalendarz z różnymi typami wydarzeń (mecze, treningi, fizjoterapia)
- **Notatki scoutingowe**: Szczegółowe notatki o przeciwnikach z oceną gwiazdową
- **Integracja Google Calendar**: Synchronizacja wydarzeń z kalendarzem Google
- **Responsywny design**: Działa na wszystkich urządzeniach

## 🚀 Uruchomienie

### Opcja 1: Serwer lokalny (ZALECANE)

```bash
# Python 3
cd "/ścieżka/do/projektu/Blania"
python3 -m e http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Następnie otwórz: `http://localhost:8000/main.html`

### Opcja 2: Bezpośrednio w przeglądarce

Kliknij dwukrotnie na `main.html` (niektóre funkcje mogą nie działać z powodu CORS)

## 📁 Struktura projektu

```
Blania/
├── main.html              # Główna strona aplikacji
├── blania.html           # Statystyki meczu
├── add-event.html        # Dodawanie wydarzeń
├── notes-form.html       # Formularz notatek
├── privacy.html          # Polityka prywatności
├── styles.css            # Skonsolidowane style CSS
├── storage.js            # Moduł obsługi localStorage
├── stateManager.js       # Centralne zarządzanie stanem
├── errorHandler.js       # Zaawansowana obsługa błędów
├── performance.js        # Optymalizacja wydajności
├── eventHandlers.js      # Obsługa event listenerów
├── app.js               # Główna aplikacja
├── save_stats.php       # Backend PHP z walidacją
└── README.md            # Ten plik
```

## 🔧 Nowe funkcjonalności (Refaktoryzacja 2024)

### 1. **Zarządzanie stanem**
- Centralny state manager z systemem subskrypcji
- Automatyczne synchronizowanie z localStorage
- Middleware system dla akcji

### 2. **Obsługa błędów**
- Klasyfikacja błędów (sieć, walidacja, autoryzacja)
- Automatyczne retry z exponential backoff
- Użytkownik-friendly komunikaty błędów
- Logowanie błędów do localStorage

### 3. **Walidacja po stronie serwera**
- Kompleksowa walidacja danych w PHP
- Sanityzacja inputów
- Retry mechanism dla bazy danych
- JSON API responses

### 4. **Optymalizacja wydajności**
- Lazy loading obrazów
- Konwersja PNG do WebP
- Debounce i throttle
- Batch processing
- Memory management
- Performance monitoring

### 5. **Utrzymywalność kodu**
- Pełna dokumentacja JSDoc
- Usunięte magic numbers
- System testów jednostkowych
- Centralna konfiguracja
- API documentation

### 6. **Usunięte duplikaty**
- Jeden plik CSS zamiast trzech
- Modularny JavaScript
- Scentralizowana obsługa localStorage
- Usunięte style inline

## 🛠️ Technologie

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: PHP 7.4+ z PDO
- **Baza danych**: MySQL
- **Integracje**: Google Calendar API, Google OAuth
- **Optymalizacja**: WebP, Lazy Loading, Service Workers

## 📱 Responsywność

Aplikacja jest w pełni responsywna i dostosowuje się do:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (do 767px)

## 🔒 Bezpieczeństwo

- Content Security Policy (CSP)
- Walidacja i sanityzacja danych
- CORS headers
- XSS protection
- SQL injection protection (prepared statements)

## 🧪 Testy jednostkowe

### Uruchamianie testów
1. Otwórz `tests.html` w przeglądarce
2. Kliknij "Uruchom wszystkie testy"
3. Sprawdź wyniki w interfejsie

### Dostępne testy
- **Storage Tests**: Testy modułu localStorage (16 testów)
- **Error Handler Tests**: Testy obsługi błędów (15 testów)
- **CSS Tests**: Testy ładowania i stylowania CSS (6 testów)
- **Performance Tests**: Testy optymalizacji wydajności

### Uruchamianie w konsoli
```javascript
// Uruchom wszystkie testy (37 testów)
const testManager = new TestManager();
await testManager.runAllTests();

// Uruchom konkretne testy
const storageTests = new StorageTests(); // 16 testów
await storageTests.run();

const errorTests = new ErrorHandlerTests(); // 15 testów
await errorTests.run();

// Testy CSS (6 testów) - tylko w tests.html
// Kliknij "Testy CSS" w interfejsie
```

## 🐛 Debugowanie

### Konsola deweloperska
```javascript
// Sprawdź stan aplikacji
console.log(window.stateManager.getState());

// Sprawdź błędy
console.log(window.errorHandler.getStoredErrors());

// Sprawdź wydajność
console.log(window.performanceOptimizer.getPerformanceMetrics());
```

### Eksport błędów
```javascript
// Eksportuj błędy do pliku JSON
window.errorHandler.exportErrors();
```

## 🚀 Wydajność

### Metryki Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Optymalizacje
- Obrazy w formacie WebP
- Lazy loading
- Critical CSS inline
- Minifikacja zasobów
- Caching w localStorage

## 📊 Monitoring

Aplikacja automatycznie monitoruje:
- Czas ładowania komponentów
- Błędy JavaScript
- Metryki wydajności
- Użycie pamięci

## 🔄 Migracja z poprzedniej wersji

Wszystkie dane z localStorage są automatycznie migrowane. Nie ma potrzeby ręcznej migracji danych.

## 📝 Licencja

© 2024 Blanka. Wszelkie prawa zastrzeżone.

## 🤝 Wsparcie

W przypadku problemów:
1. Sprawdź konsolę deweloperską
2. Sprawdź czy serwer lokalny działa
3. Sprawdź połączenie internetowe (dla Google API)
4. Wyczyść cache przeglądarki

## 🔮 Przyszłe ulepszenia

- [ ] PWA (Progressive Web App)
- [ ] Offline support
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Team management
- [ ] Data export/import
- [ ] Dark mode
- [ ] Multi-language support
