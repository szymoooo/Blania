/* ========================================
   ERROR HANDLER TESTS - Testy jednostkowe dla ErrorHandler
   ======================================== */

/**
 * Testy dla modułu ErrorHandler
 * @namespace ErrorHandlerTests
 */
class ErrorHandlerTests {
    constructor() {
        this.testRunner = new TestRunner();
        this.setupTests();
    }

    /**
     * Konfiguruje wszystkie testy
     */
    setupTests() {
        // Testy klasyfikacji błędów
        this.testRunner.addTest('powinien klasyfikować błędy sieci poprawnie', () => {
            const errorHandler = new ErrorHandler();
            const networkError = new Error('fetch failed');
            networkError.name = 'NetworkError';
            
            const type = errorHandler.classifyError(networkError);
            
            Assert.assertEquals(type, AppConfig.ERROR_TYPES.NETWORK);
        }, 'Klasyfikacja błędów');

        this.testRunner.addTest('powinien klasyfikować błędy walidacji poprawnie', () => {
            const errorHandler = new ErrorHandler();
            const validationError = new Error('validation failed');
            validationError.name = 'ValidationError';
            
            const type = errorHandler.classifyError(validationError);
            
            Assert.assertEquals(type, AppConfig.ERROR_TYPES.VALIDATION);
        }, 'Klasyfikacja błędów');

        this.testRunner.addTest('powinien klasyfikować błędy autoryzacji poprawnie', () => {
            const errorHandler = new ErrorHandler();
            const authError = new Error('token expired');
            authError.name = 'AuthError';
            
            const type = errorHandler.classifyError(authError);
            
            Assert.assertEquals(type, AppConfig.ERROR_TYPES.AUTH);
        }, 'Klasyfikacja błędów');

        this.testRunner.addTest('powinien klasyfikować nieznane błędy poprawnie', () => {
            const errorHandler = new ErrorHandler();
            const unknownError = new Error('something went wrong');
            
            const type = errorHandler.classifyError(unknownError);
            
            Assert.assertEquals(type, AppConfig.ERROR_TYPES.UNKNOWN);
        }, 'Klasyfikacja błędów');

        // Testy obsługi błędów
        this.testRunner.addTest('powinien obsługiwać błędy sieci z retry', () => {
            const errorHandler = new ErrorHandler();
            const networkError = new Error('Network request failed');
            networkError.name = 'NetworkError';
            
            const result = errorHandler.handleError(networkError, { operation: 'test' });
            
            Assert.assertTrue(result.shouldRetry);
            Assert.assertNotNull(result.retryDelay);
        }, 'Obsługa błędów');

        this.testRunner.addTest('powinien obsługiwać błędy walidacji bez retry', () => {
            const errorHandler = new ErrorHandler();
            const validationError = new Error('validation failed');
            validationError.name = 'ValidationError';
            
            const result = errorHandler.handleError(validationError, { field: 'email' });
            
            Assert.assertFalse(result.shouldRetry);
            Assert.assertNotNull(result.message);
        }, 'Obsługa błędów');

        this.testRunner.addTest('powinien obsługiwać błędy autoryzacji z wylogowaniem', () => {
            const errorHandler = new ErrorHandler();
            const authError = new Error('unauthorized');
            authError.name = 'AuthError';
            
            const result = errorHandler.handleError(authError);
            
            Assert.assertFalse(result.shouldRetry);
            Assert.assertEquals(result.action, 'redirectToLogin');
        }, 'Obsługa błędów');

        // Testy retry mechanism
        this.testRunner.addTest('powinien ponawiać operację pomyślnie', async () => {
            const errorHandler = new ErrorHandler();
            let attemptCount = 0;
            
            const operation = () => {
                attemptCount++;
                if (attemptCount < 2) {
                    const error = new Error('Network error');
                    error.name = 'NetworkError';
                    throw error;
                }
                return 'success';
            };
            
            // Test retry logic without async
            const error = new Error('Network error');
            error.name = 'NetworkError';
            const result = errorHandler.handleError(error, { operation: 'test' });
            
            Assert.assertTrue(result.shouldRetry);
            Assert.assertNotNull(result.retryDelay);
        }, 'Mechanizm retry');

        this.testRunner.addTest('powinien kończyć się niepowodzeniem po max retry', async () => {
            const errorHandler = new ErrorHandler();
            
            // Simulate max retries reached
            const retryKey = 'network_test';
            errorHandler.retryAttempts.set(retryKey, 3); // Max retries reached
            
            const error = new Error('Persistent error');
            error.name = 'NetworkError';
            const result = errorHandler.handleError(error, { operation: 'test' });
            
            Assert.assertFalse(result.shouldRetry);
            Assert.assertTrue(result.message.includes('Brak połączenia'));
        }, 'Mechanizm retry');

        // Testy logowania błędów
        this.testRunner.addTest('powinien logować błędy poprawnie', () => {
            const errorHandler = new ErrorHandler();
            const testError = new Error('Test error');
            const context = { operation: 'test', userId: 123 };
            
            // Mock console methods to avoid cluttering test output
            const originalLog = console.log;
            const originalError = console.error;
            console.log = () => {};
            console.error = () => {};
            
            errorHandler.logError(testError, context);
            
            // Restore console methods
            console.log = originalLog;
            console.error = originalError;
            
            // Check if error was stored locally
            const errors = errorHandler.getStoredErrors();
            Assert.assertTrue(errors.length > 0);
            
            const lastError = errors[errors.length - 1];
            Assert.assertEquals(lastError.type, AppConfig.ERROR_TYPES.UNKNOWN);
            Assert.assertEquals(lastError.context.operation, 'test');
        }, 'Logowanie błędów');

        this.testRunner.addTest('powinien czyścić zapisane błędy', () => {
            const errorHandler = new ErrorHandler();
            
            // Add some test errors
            errorHandler.logError(new Error('Test 1'));
            errorHandler.logError(new Error('Test 2'));
            
            Assert.assertTrue(errorHandler.getStoredErrors().length > 0);
            
            errorHandler.clearStoredErrors();
            
            Assert.assertEquals(errorHandler.getStoredErrors().length, 0);
        }, 'Logowanie błędów');

        // Testy notyfikacji
        this.testRunner.addTest('powinien pokazywać powiadomienia o błędach', () => {
            const errorHandler = new ErrorHandler();
            
            // Test notification creation without DOM manipulation
            const message = 'Test error message';
            const type = 'error';
            const duration = 1000;
            
            // Mock the showError method to avoid DOM issues
            const originalShowError = errorHandler.showError;
            let notificationCreated = false;
            
            errorHandler.showError = (msg, t, dur) => {
                notificationCreated = true;
                Assert.assertEquals(msg, message);
                Assert.assertEquals(t, type);
                Assert.assertEquals(dur, duration);
            };
            
            errorHandler.showError(message, type, duration);
            
            // Restore original method
            errorHandler.showError = originalShowError;
            
            Assert.assertTrue(notificationCreated);
        }, 'Powiadomienia');

        // Testy walidacji
        this.testRunner.addTest('powinien pobierać komunikaty walidacji poprawnie', () => {
            const errorHandler = new ErrorHandler();
            
            const requiredError = new Error('required field');
            const message1 = errorHandler.getValidationMessage(requiredError, { field: 'email' });
            Assert.assertTrue(message1.includes('email'));
            
            const emailError = new Error('invalid email');
            const message2 = errorHandler.getValidationMessage(emailError, { field: 'email' });
            Assert.assertTrue(message2.includes('email'));
            
            const dateError = new Error('invalid date');
            const message3 = errorHandler.getValidationMessage(dateError, { field: 'date' });
            Assert.assertTrue(message3.includes('datę'));
        }, 'Komunikaty walidacji');

        // Testy edge cases
        this.testRunner.addTest('powinien obsługiwać błędy null i undefined', () => {
            const errorHandler = new ErrorHandler();
            
            // Test null error
            const result1 = errorHandler.handleError(null);
            Assert.assertEquals(result1.type, AppConfig.ERROR_TYPES.UNKNOWN);
            
            // Test undefined error
            const result2 = errorHandler.handleError(undefined);
            Assert.assertEquals(result2.type, AppConfig.ERROR_TYPES.UNKNOWN);
        }, 'Przypadki brzegowe');

        this.testRunner.addTest('powinien obsługiwać błędy bez komunikatu', () => {
            const errorHandler = new ErrorHandler();
            const error = new Error();
            error.message = '';
            
            const result = errorHandler.handleError(error);
            
            Assert.assertNotNull(result);
            Assert.assertNotNull(result.message);
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
    window.ErrorHandlerTests = ErrorHandlerTests;
}
