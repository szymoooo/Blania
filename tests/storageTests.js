/* ========================================
   STORAGE TESTS - Testy jednostkowe dla StorageManager
   ======================================== */

/**
 * Testy dla modułu StorageManager
 * @namespace StorageTests
 */
class StorageTests {
    constructor() {
        this.testRunner = new TestRunner();
        this.setupTests();
    }

    /**
     * Konfiguruje wszystkie testy
     */
    setupTests() {
        // Testy podstawowych operacji
        this.testRunner.addTest('powinien zapisywać i pobierać dane', () => {
            const storage = new StorageManager();
            const testData = { name: 'test', value: 123 };
            
            storage.set('testKey', testData);
            const retrieved = storage.get('testKey');
            
            Assert.assertEquals(retrieved.name, 'test');
            Assert.assertEquals(retrieved.value, 123);
        }, 'Podstawowe operacje');

        this.testRunner.addTest('powinien zwracać wartość domyślną dla nieistniejącego klucza', () => {
            const storage = new StorageManager();
            const defaultValue = 'default';
            
            const result = storage.get('nonExistentKey', defaultValue);
            
            Assert.assertEquals(result, defaultValue);
        }, 'Podstawowe operacje');

        this.testRunner.addTest('powinien obsługiwać błędy parsowania JSON', () => {
            const storage = new StorageManager();
            
            // Simulate corrupted JSON in localStorage
            localStorage.setItem('corruptedKey', 'invalid json{');
            const result = storage.get('corruptedKey', 'fallback');
            
            Assert.assertEquals(result, 'fallback');
        }, 'Error Handling');

        this.testRunner.addTest('powinien usuwać dane poprawnie', () => {
            const storage = new StorageManager();
            const testData = { test: true };
            
            storage.set('removeKey', testData);
            Assert.assertTrue(storage.has('removeKey'));
            
            storage.remove('removeKey');
            Assert.assertFalse(storage.has('removeKey'));
        }, 'Podstawowe operacje');

        this.testRunner.addTest('powinien obsługiwać usuwanie wielu kluczy', () => {
            const storage = new StorageManager();
            
            storage.set('key1', 'value1');
            storage.set('key2', 'value2');
            storage.set('key3', 'value3');
            
            storage.removeMultiple(['key1', 'key3']);
            
            Assert.assertFalse(storage.has('key1'));
            Assert.assertTrue(storage.has('key2'));
            Assert.assertFalse(storage.has('key3'));
        }, 'Podstawowe operacje');

        // Testy specjalnych metod
        this.testRunner.addTest('powinien zapisywać i pobierać mecze', () => {
            const storage = new StorageManager();
            
            // Clear existing data first
            storage.clear();
            
            const match = {
                id: 1,
                team: 'Test Team',
                date: '2024-01-01',
                total: 25
            };
            
            storage.saveMatch(match);
            const matches = storage.getSavedMatches();
            
            Assert.assertEquals(matches.length, 1);
            Assert.assertEquals(matches[0].team, 'Test Team');
        }, 'Operacje meczów');

        this.testRunner.addTest('powinien aktualizować istniejący mecz', () => {
            const storage = new StorageManager();
            
            // Clear existing data first
            storage.clear();
            
            const match1 = { id: 1, team: 'Team A', total: 10 };
            const match2 = { id: 1, team: 'Team B', total: 20 };
            
            storage.saveMatch(match1);
            storage.saveMatch(match2);
            
            const matches = storage.getSavedMatches();
            Assert.assertEquals(matches.length, 1);
            Assert.assertEquals(matches[0].team, 'Team B');
        }, 'Operacje meczów');

        this.testRunner.addTest('powinien usuwać mecz poprawnie', () => {
            const storage = new StorageManager();
            
            // Clear existing data first
            storage.clear();
            
            const match = { id: 1, team: 'Test Team', total: 25 };
            
            storage.saveMatch(match);
            Assert.assertEquals(storage.getSavedMatches().length, 1);
            
            storage.deleteMatch(1);
            Assert.assertEquals(storage.getSavedMatches().length, 0);
        }, 'Operacje meczów');

        this.testRunner.addTest('powinien zapisywać i pobierać wydarzenia', () => {
            const storage = new StorageManager();
            
            // Clear existing data first
            storage.clear();
            
            const event = {
                id: 1,
                name: 'Test Event',
                date: '2024-01-01T10:00',
                type: 'training'
            };
            
            storage.saveEvent(event);
            const events = storage.getSavedEvents();
            
            Assert.assertEquals(events.length, 1);
            Assert.assertEquals(events[0].name, 'Test Event');
        }, 'Operacje wydarzeń');

        this.testRunner.addTest('powinien zapisywać i pobierać notatki', () => {
            const storage = new StorageManager();
            
            // Clear existing data first
            storage.clear();
            
            const note = {
                strengths: 'Fast player',
                weaknesses: 'Poor defense',
                rating: 4
            };
            
            storage.saveTeamNote('Test Team', note);
            const teamNotes = storage.getTeamNotes('Test Team');
            
            Assert.assertEquals(teamNotes.length, 1);
            Assert.assertEquals(teamNotes[0].strengths, 'Fast player');
        }, 'Operacje notatek');

        this.testRunner.addTest('powinien aktualizować istniejącą notatkę', () => {
            const storage = new StorageManager();
            
            // Clear existing data first
            storage.clear();
            
            const note1 = { strengths: 'Old strength', rating: 3 };
            const note2 = { strengths: 'New strength', rating: 5 };
            
            storage.saveTeamNote('Test Team', note1);
            storage.saveTeamNote('Test Team', note2, 0);
            
            const teamNotes = storage.getTeamNotes('Test Team');
            Assert.assertEquals(teamNotes[0].strengths, 'New strength');
        }, 'Operacje notatek');

        // Testy Google Auth
        this.testRunner.addTest('powinien obsługiwać dane użytkownika Google', () => {
            const storage = new StorageManager();
            const user = { name: 'Test User', email: 'test@example.com' };
            
            storage.setGoogleUser(user);
            const retrievedUser = storage.getGoogleUser();
            
            Assert.assertEquals(retrievedUser.name, 'Test User');
            Assert.assertEquals(retrievedUser.email, 'test@example.com');
        }, 'Autoryzacja Google');

        this.testRunner.addTest('powinien czyścić dane autoryzacji Google', () => {
            const storage = new StorageManager();
            const user = { name: 'Test User' };
            const token = 'test-token';
            
            storage.setGoogleUser(user);
            storage.setGoogleAccessToken(token);
            
            storage.clearGoogleAuth();
            
            Assert.assertNull(storage.getGoogleUser());
            Assert.assertNull(storage.getGoogleAccessToken());
        }, 'Autoryzacja Google');

        // Testy edge cases
        this.testRunner.addTest('powinien obsługiwać wartości null i undefined', () => {
            const storage = new StorageManager();
            
            storage.set('nullKey', null);
            storage.set('undefinedKey', undefined);
            
            Assert.assertNull(storage.get('nullKey'));
            // JSON.stringify converts undefined to null, so we check for null instead
            Assert.assertNull(storage.get('undefinedKey'));
        }, 'Przypadki brzegowe');

        this.testRunner.addTest('powinien obsługiwać puste stringi', () => {
            const storage = new StorageManager();
            
            storage.set('emptyKey', '');
            const result = storage.get('emptyKey');
            
            Assert.assertEquals(result, '');
        }, 'Przypadki brzegowe');

        this.testRunner.addTest('powinien obsługiwać duże obiekty', () => {
            const storage = new StorageManager();
            const largeObject = {
                data: 'x'.repeat(10000),
                array: new Array(1000).fill('test')
            };
            
            const success = storage.set('largeKey', largeObject);
            Assert.assertTrue(success);
            
            const retrieved = storage.get('largeKey');
            Assert.assertEquals(retrieved.data.length, 10000);
            Assert.assertEquals(retrieved.array.length, 1000);
        }, 'Przypadki brzegowe');
    }

    /**
     * Uruchamia wszystkie testy
     * @returns {Promise<Object>} Wyniki testów
     */
    async run() {
        return await this.testRunner.runAll();
    }
}

// Uruchom testy jeśli plik jest ładowany bezpośrednio
if (typeof window !== 'undefined') {
    window.StorageTests = StorageTests;
}
