# 🏀 System Zarządzania Meczem Koszykówki

Kompletny system do zarządzania meczami koszykówki na żywo z panelem administracyjnym, live feedem wydarzeń i automatycznym licznikiem czasu.

## 🌟 Funkcjonalności

### ⚙️ Panel Administracyjny
- **Ustawienia drużyn**: Edycja nazw i kolorów drużyn
- **Kontrola meczu**: Start/Pauza/Reset meczu
- **Zarządzanie okresami**: Automatyczne przechodzenie między okresami
- **Dodawanie wydarzeń**: Gole, faule, timeout'y, komentarze
- **Szybkie akcje**: Przyciski do szybkiego dodawania punktów

### 📊 Live Display
- **Aktualizacja wyniku na żywo**: Wynik główny i po okresach
- **Timer meczu**: Automatyczny licznik z minutami i sekundami
- **Live feed**: Wydarzenia w czasie rzeczywistym
- **Kolory drużyn**: Wizualne reprezentacje kolorów zespołów

### 📈 Statystyki
- **Punkty**: Łączne i po okresach
- **Faule**: Liczba fauli dla każdej drużyny
- **Timeout'y**: Wykorzystane timeout'y
- **Wydarzenia**: Wszystkie wydarzenia meczu

### 💾 Zarządzanie Danymi
- **Automatyczne zapisywanie**: Co 30 sekund
- **Eksport danych**: Pobieranie danych meczu w formacie JSON
- **Trwałość**: Zapisywanie w localStorage przeglądarki

## 🚀 Jak Używać

### 1. Uruchomienie
1. Otwórz plik `zarzadzanie-meczu.html` w przeglądarce
2. System automatycznie się załaduje

### 2. Konfiguracja Meczu
1. **Ustawienia Drużyn**:
   - Wpisz nazwy drużyn w polach "Nazwa drużyny"
   - Wybierz kolory główne i dodatkowe używając kolorów palety
   
2. **Rozpoczęcie Meczu**:
   - Kliknij przycisk "▶️ Start"
   - Timer rozpocznie odliczanie automatycznie
   - System rozpocznie pierwszy okres

### 3. Zarządzanie Wydarzeniami

#### Szybkie Punkty
- Użyj przycisków "+2 Gospodarze/Goście" dla szybkiego dodania 2 punktów
- Użyj przycisków "+3 Gospodarze/Goście" dla rzutów za 3 punkty

#### Szczegółowe Wydarzenia
1. **Wybierz typ wydarzenia**:
   - Gol (2 pkt) / Gol za 3 pkt
   - Faul
   - Timeout
   - Komentarz

2. **Wybierz drużynę**:
   - Gospodarze / Goście / Obie (dla neutralnych wydarzeń)

3. **Dodaj szczegóły zawodnika** (opcjonalne):
   - Imię i nazwisko
   - Numer zawodnika

4. **Opisz wydarzenie**:
   - Szczegółowy opis w polu tekstowym

5. **Kliknij "Dodaj Wydarzenie"**

### 4. Kontrola Meczu
- **⏸️ Pauza**: Zatrzymanie licznika bez resetu
- **🔄 Reset**: Pełne zresetowanie meczu (wymaga potwierdzenia)
- **⏭️ Następny okres**: Ręczne przejście do kolejnego okresu

### 5. Monitorowanie
- **Live Feed**: Obserwuj wszystkie wydarzenia w czasie rzeczywistym
- **Statystyki**: Sprawdzaj bieżące statystyki w panelu po prawej
- **Status**: Wskaźnik w prawym górnym rogu pokazuje stan meczu

### 6. Zapisywanie i Eksport
- **Automatyczne zapisywanie**: Działa w tle co 30 sekund
- **💾 Zapisz mecz**: Ręczne zapisanie z potwierdzeniem
- **📥 Eksportuj dane**: Pobierz pełne dane meczu jako plik JSON

## 🛠️ Zaawansowane Funkcje

### Automatyczne Funkcje
- **Timer okresów**: Automatycznie kończy okresy po 10 minutach
- **Przejścia między okresami**: Automatyczne przechodzenie z powiadomieniami
- **Wykrywanie końca meczu**: Automatyczne zakończenie po 4 okresach

### Responsywność
- **Mobilne urządzenia**: Interfejs dostosowuje się do różnych rozdzielczości
- **Tablet**: Optymalne układy dla średnich ekranów
- **Desktop**: Pełna funkcjonalność na dużych ekranach

### Personalizacja
- **Kolory drużyn**: Pełna paleta kolorów
- **Nazwy drużyn**: Dowolne nazwy
- **Czas okresów**: Można modyfikować w kodzie (domyślnie 10 minut)

## 🔧 Struktura Plików

```
📁 Projekt/
├── 📄 zarzadzanie-meczu.html    # Główny plik HTML
├── 🎨 style-mecz.css            # Style CSS
├── ⚙️ mecz-manager.js           # Logika JavaScript
└── 📖 README-MECZ.md            # Ta instrukcja
```

## 💡 Wskazówki

### Najlepsze Praktyki
1. **Przed meczem**: Skonfiguruj nazwy i kolory drużyn
2. **Podczas meczu**: Używaj szybkich przycisków dla efektywności
3. **Po meczu**: Eksportuj dane dla archiwizacji

### Rozwiązywanie Problemów
- **Mecz się nie rozpoczyna**: Sprawdź czy kliknąłeś przycisk "Start"
- **Brak zapisanych danych**: Włącz localStorage w przeglądarce
- **Błędy wyświetlania**: Odśwież stronę (dane są zapisane automatycznie)

### Funkcje Awaryjne
- **Restore**: System automatycznie przywraca ostatni mecz przy ponownym załadowaniu
- **Backup**: Eksportuj dane regularnie jako backup
- **Reset awaryjny**: Użyj kombinacji Ctrl+Shift+R dla pełnego resetu

## 🎯 Przykłady Użycia

### Scenariusz: Mecz Ligi
1. Otwórz system 30 minut przed meczem
2. Ustaw nazwy drużyn: "Roosters" vs "Eagles"
3. Ustaw kolory reprezentatywne
4. Rozpocznij mecz przyciskiem Start
5. Dodawaj wydarzenia w czasie rzeczywistym
6. System automatycznie zarządza czasem i okresami
7. Po meczu eksportuj dane do archiwum

### Scenariusz: Mecz Treningowy
1. Użyj funkcji Reset na początku
2. Ustawienia podstawowe (bez szczegółów zawodników)
3. Skup się na szybkich przyciskach punktów
4. Używaj pauzy dla przerw instruktażowych
5. Zapisz wynik na koniec

## ⚡ Skróty Klawiszowe

- **Spacja**: Start/Pauza meczu (gdy focus na stronie)
- **R**: Reset meczu (z potwierdzeniem)
- **N**: Następny okres
- **S**: Zapisz mecz

## 🔒 Bezpieczeństwo Danych

- **Automatyczne kopie**: Dane zapisywane co 30 sekund
- **LocalStorage**: Trwałość między sesjami przeglądarki
- **Export JSON**: Możliwość tworzenia zewnętrznych kopii zapasowych
- **Walidacja**: System sprawdza poprawność danych przed zapisem

---

## 📞 Wsparcie

System został stworzony z myślą o prostocie użytkowania i niezawodności. Wszystkie funkcje zostały przetestowane w środowisku przeglądarki.

**Wymagania systemowe:**
- Nowoczesna przeglądarka (Chrome, Firefox, Safari, Edge)
- JavaScript włączony
- LocalStorage dostępny
- Rozdzielczość minimum 768px szerokości dla pełnej funkcjonalności

**Kompatybilność:**
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers

---

*System Zarządzania Meczem Koszykówki - Profesjonalne narzędzie do obsługi meczów na żywo*