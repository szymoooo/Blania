/* ========================================
   TEST RUNNER - System testów jednostkowych
   ======================================== */

/**
 * Klasa do uruchamiania testów jednostkowych
 * @class TestRunner
 */
class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
        this.currentSuite = null;
    }

    /**
     * Dodaje test do kolekcji
     * @param {string} name - Nazwa testu
     * @param {Function} testFn - Funkcja testowa
     * @param {string} suite - Nazwa grupy testów
     */
    addTest(name, testFn, suite = 'default') {
        this.tests.push({ name, testFn, suite });
    }

    /**
     * Uruchamia wszystkie testy
     * @returns {Object} Wyniki testów
     */
    async runAll() {
        console.log('🧪 Uruchamianie testów...\n');
        
        this.results = [];
        const suites = this.groupTestsBySuite();
        
        for (const [suiteName, tests] of Object.entries(suites)) {
            console.log(`📁 Grupa: ${suiteName}`);
            this.currentSuite = suiteName;
            
            for (const test of tests) {
                await this.runSingleTest(test);
            }
            console.log(''); // Pusta linia między grupami
        }
        
        this.printSummary();
        return this.getResults();
    }

    /**
     * Uruchamia pojedynczy test
     * @param {Object} test - Obiekt testu
     */
    async runSingleTest(test) {
        const startTime = performance.now();
        
        try {
            await test.testFn();
            const duration = performance.now() - startTime;
            
            this.results.push({
                name: test.name,
                suite: test.suite,
                status: 'PASSED',
                duration: duration,
                error: null
            });
            
            console.log(`  ✅ ${test.name} (${duration.toFixed(2)}ms)`);
        } catch (error) {
            const duration = performance.now() - startTime;
            
            this.results.push({
                name: test.name,
                suite: test.suite,
                status: 'FAILED',
                duration: duration,
                error: error.message
            });
            
            console.log(`  ❌ ${test.name} (${duration.toFixed(2)}ms)`);
            console.log(`     Error: ${error.message}`);
        }
    }

    /**
     * Grupuje testy według nazwy grupy
     * @returns {Object} Grupowane testy
     */
    groupTestsBySuite() {
        return this.tests.reduce((groups, test) => {
            if (!groups[test.suite]) {
                groups[test.suite] = [];
            }
            groups[test.suite].push(test);
            return groups;
        }, {});
    }

    /**
     * Wyświetla podsumowanie testów
     */
    printSummary() {
        const passed = this.results.filter(r => r.status === 'PASSED').length;
        const failed = this.results.filter(r => r.status === 'FAILED').length;
        const total = this.results.length;
        const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

        console.log('📊 Podsumowanie testów:');
        console.log(`   Przeszły: ${passed}`);
        console.log(`   Nie przeszły: ${failed}`);
        console.log(`   Razem: ${total}`);
        console.log(`   Czas: ${totalTime.toFixed(2)}ms`);
        
        if (failed > 0) {
            console.log('\n❌ Nieudane testy:');
            this.results
                .filter(r => r.status === 'FAILED')
                .forEach(r => console.log(`   - ${r.suite}: ${r.name}`));
        }
    }

    /**
     * Zwraca wyniki testów
     * @returns {Object} Wyniki testów
     */
    getResults() {
        const passed = this.results.filter(r => r.status === 'PASSED').length;
        const failed = this.results.filter(r => r.status === 'FAILED').length;
        
        return {
            total: this.results.length,
            passed,
            failed,
            success: failed === 0,
            results: this.results
        };
    }
}

/**
 * Klasa do asercji w testach
 * @class Assert
 */
class Assert {
    /**
     * Sprawdza czy wartość jest prawdziwa
     * @param {*} value - Wartość do sprawdzenia
     * @param {string} message - Komunikat błędu
     */
    static assertTrue(value, message = 'Expected true') {
        if (!value) {
            throw new Error(message);
        }
    }

    /**
     * Sprawdza czy wartość jest fałszywa
     * @param {*} value - Wartość do sprawdzenia
     * @param {string} message - Komunikat błędu
     */
    static assertFalse(value, message = 'Expected false') {
        if (value) {
            throw new Error(message);
        }
    }

    /**
     * Sprawdza czy dwie wartości są równe
     * @param {*} actual - Wartość rzeczywista
     * @param {*} expected - Wartość oczekiwana
     * @param {string} message - Komunikat błędu
     */
    static assertEquals(actual, expected, message = 'Values are not equal') {
        if (actual !== expected) {
            throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`);
        }
    }

    /**
     * Sprawdza czy dwie wartości nie są równe
     * @param {*} actual - Wartość rzeczywista
     * @param {*} expected - Wartość oczekiwana
     * @param {string} message - Komunikat błędu
     */
    static assertNotEquals(actual, expected, message = 'Values should not be equal') {
        if (actual === expected) {
            throw new Error(`${message}. Both values: ${actual}`);
        }
    }

    /**
     * Sprawdza czy wartość jest null
     * @param {*} value - Wartość do sprawdzenia
     * @param {string} message - Komunikat błędu
     */
    static assertNull(value, message = 'Expected null') {
        if (value !== null) {
            throw new Error(`${message}. Actual: ${value}`);
        }
    }

    /**
     * Sprawdza czy wartość nie jest null
     * @param {*} value - Wartość do sprawdzenia
     * @param {string} message - Komunikat błędu
     */
    static assertNotNull(value, message = 'Expected not null') {
        if (value === null) {
            throw new Error(message);
        }
    }

    /**
     * Sprawdza czy tablica zawiera element
     * @param {Array} array - Tablica do sprawdzenia
     * @param {*} item - Element do znalezienia
     * @param {string} message - Komunikat błędu
     */
    static assertContains(array, item, message = 'Array does not contain item') {
        if (!array.includes(item)) {
            throw new Error(`${message}. Array: ${JSON.stringify(array)}, Item: ${item}`);
        }
    }

    /**
     * Sprawdza czy funkcja rzuca wyjątek
     * @param {Function} fn - Funkcja do wykonania
     * @param {string} expectedError - Oczekiwany błąd
     * @param {string} message - Komunikat błędu
     */
    static assertThrows(fn, expectedError = null, message = 'Expected function to throw') {
        try {
            fn();
            throw new Error(message);
        } catch (error) {
            if (expectedError && !error.message.includes(expectedError)) {
                throw new Error(`${message}. Expected: ${expectedError}, Actual: ${error.message}`);
            }
        }
    }
}

// Utwórz globalne instancje
window.TestRunner = TestRunner;
window.Assert = Assert;
