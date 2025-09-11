/* ========================================
   ERROR HANDLER - Zaawansowana obsługa błędów
   Rozwiązuje problemy z obsługą błędów
   ======================================== */

class ErrorHandler {
    constructor() {
        this.errorTypes = {
            NETWORK: 'NETWORK_ERROR',
            VALIDATION: 'VALIDATION_ERROR',
            AUTH: 'AUTH_ERROR',
            STORAGE: 'STORAGE_ERROR',
            API: 'API_ERROR',
            UNKNOWN: 'UNKNOWN_ERROR'
        };
        
        this.errorMessages = {
            [this.errorTypes.NETWORK]: 'Problem z połączeniem internetowym',
            [this.errorTypes.VALIDATION]: 'Nieprawidłowe dane wejściowe',
            [this.errorTypes.AUTH]: 'Błąd autoryzacji',
            [this.errorTypes.STORAGE]: 'Błąd zapisu danych',
            [this.errorTypes.API]: 'Błąd API',
            [this.errorTypes.UNKNOWN]: 'Nieoczekiwany błąd'
        };
        
        this.retryAttempts = new Map();
        this.maxRetries = 3;
    }

    // ===== ERROR CLASSIFICATION =====
    
    classifyError(error) {
        if (!error) return this.errorTypes.UNKNOWN;
        
        const name = error.name || '';
        const message = error.message || '';
        
        if (name === 'NetworkError' || message.includes('fetch')) {
            return this.errorTypes.NETWORK;
        }
        if (name === 'ValidationError' || message.includes('validation')) {
            return this.errorTypes.VALIDATION;
        }
        if (name === 'AuthError' || message.includes('auth') || message.includes('token')) {
            return this.errorTypes.AUTH;
        }
        if (name === 'StorageError' || message.includes('localStorage')) {
            return this.errorTypes.STORAGE;
        }
        if (message.includes('API') || message.includes('googleapis')) {
            return this.errorTypes.API;
        }
        return this.errorTypes.UNKNOWN;
    }
    
    // ===== ERROR LOGGING =====
    
    logError(error, context = {}) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            type: this.classifyError(error),
            message: error.message || 'No message',
            stack: error.stack || 'No stack trace',
            context: context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // console.error('Error logged:', errorInfo); // Wyłączone żeby nie spamować konsoli
        
        // Send to external logging service if available
        this.sendToLoggingService(errorInfo);
        
        // Store in localStorage for debugging
        this.storeErrorLocally(errorInfo);
    }
    
    sendToLoggingService(errorInfo) {
        // In production, this would send to a real logging service
        // For now, just log to console
        console.log('Would send to logging service:', errorInfo);
    }
    
    storeErrorLocally(errorInfo) {
        try {
            const errors = JSON.parse(localStorage.getItem('appErrors') || '[]');
            errors.push(errorInfo);
            
            // Keep only last 50 errors
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }
            
            localStorage.setItem('appErrors', JSON.stringify(errors));
        } catch (e) {
            console.error('Failed to store error locally:', e);
        }
    }
    
    // ===== ERROR HANDLING STRATEGIES =====
    
    handleError(error, context = {}) {
        // Handle null/undefined errors
        if (!error) {
            error = { name: 'UnknownError', message: 'Unknown error occurred' };
        }
        
        const errorType = this.classifyError(error);
        this.logError(error, context);
        
        switch (errorType) {
            case this.errorTypes.NETWORK:
                return this.handleNetworkError(error, context);
            case this.errorTypes.VALIDATION:
                return this.handleValidationError(error, context);
            case this.errorTypes.AUTH:
                return this.handleAuthError(error, context);
            case this.errorTypes.STORAGE:
                return this.handleStorageError(error, context);
            case this.errorTypes.API:
                return this.handleApiError(error, context);
            default:
                return this.handleUnknownError(error, context);
        }
    }
    
    handleNetworkError(error, context) {
        const retryKey = `network_${context.operation || 'unknown'}`;
        const attempts = this.retryAttempts.get(retryKey) || 0;
        
        if (attempts < this.maxRetries) {
            this.retryAttempts.set(retryKey, attempts + 1);
            
            return {
                type: this.errorTypes.NETWORK,
                shouldRetry: true,
                retryDelay: Math.pow(2, attempts) * 1000, // Exponential backoff
                message: `Próba ${attempts + 1} z ${this.maxRetries}...`
            };
        } else {
            this.retryAttempts.delete(retryKey);
            
            return {
                type: this.errorTypes.NETWORK,
                shouldRetry: false,
                message: 'Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie.',
                action: 'showRetryButton'
            };
        }
    }
    
    handleValidationError(error, context) {
        return {
            type: this.errorTypes.VALIDATION,
            shouldRetry: false,
            message: this.getValidationMessage(error, context),
            action: 'showValidationErrors'
        };
    }
    
    handleAuthError(error, context) {
        // Clear auth data and redirect to login
        if (window.stateManager) {
            window.stateManager.dispatch('LOGOUT');
        }
        
        return {
            type: this.errorTypes.AUTH,
            shouldRetry: false,
            message: 'Sesja wygasła. Zaloguj się ponownie.',
            action: 'redirectToLogin'
        };
    }
    
    handleStorageError(error, context) {
        return {
            type: this.errorTypes.STORAGE,
            shouldRetry: false,
            message: 'Błąd zapisu danych. Sprawdź czy przeglądarka obsługuje localStorage.',
            action: 'showStorageError'
        };
    }
    
    handleApiError(error, context) {
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            return this.handleAuthError(error, context);
        }
        
        return {
            type: this.errorTypes.API,
            shouldRetry: false,
            message: 'Błąd serwera. Spróbuj ponownie za chwilę.',
            action: 'showApiError'
        };
    }
    
    handleUnknownError(error, context) {
        return {
            type: this.errorTypes.UNKNOWN,
            shouldRetry: false,
            message: 'Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.',
            action: 'showGenericError'
        };
    }
    
    // ===== VALIDATION HELPERS =====
    
    getValidationMessage(error, context = {}) {
        const field = context.field || 'pole';
        const value = context.value;
        
        if (error.message.includes('required')) {
            return `Pole ${field} jest wymagane.`;
        }
        if (error.message.includes('email')) {
            return 'Podaj prawidłowy adres email.';
        }
        if (error.message.includes('date')) {
            return 'Podaj prawidłową datę.';
        }
        if (error.message.includes('number')) {
            return 'Podaj prawidłową liczbę.';
        }
        if (error.message.includes('min') || error.message.includes('max')) {
            return `Wartość w polu ${field} jest poza dozwolonym zakresem.`;
        }
        
        return `Nieprawidłowa wartość w polu ${field}.`;
    }
    
    // ===== RETRY MECHANISM =====
    
    async retryOperation(operation, context = {}, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await operation();
                this.retryAttempts.delete(context.operation || 'unknown');
                return result;
            } catch (error) {
                lastError = error;
                const errorInfo = this.handleError(error, { ...context, attempt });
                
                if (!errorInfo.shouldRetry || attempt === maxRetries) {
                    break;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, errorInfo.retryDelay || 1000));
            }
        }
        
        throw lastError;
    }
    
    // ===== USER NOTIFICATIONS =====
    
    showError(message, type = 'error', duration = 5000) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = `error-notification error-notification--${type}`;
        
        const content = document.createElement('div');
        content.className = 'error-notification__content';
        
        const icon = document.createElement('span');
        icon.className = 'error-notification__icon';
        icon.textContent = '⚠️';
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'error-notification__message';
        messageSpan.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'error-notification__close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            notification.remove();
        });
        
        content.appendChild(icon);
        content.appendChild(messageSpan);
        content.appendChild(closeButton);
        notification.appendChild(content);
        
        // Add styles if not already added
        if (!document.getElementById('error-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'error-notification-styles';
            styles.textContent = `
                .error-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    max-width: 400px;
                    animation: slideIn 0.3s ease-out;
                }
                
                .error-notification--error {
                    border-left: 4px solid #dc3545;
                }
                
                .error-notification--warning {
                    border-left: 4px solid #ffc107;
                }
                
                .error-notification--info {
                    border-left: 4px solid #007bff;
                }
                
                .error-notification__content {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                }
                
                .error-notification__icon {
                    margin-right: 8px;
                    font-size: 18px;
                }
                
                .error-notification__message {
                    flex: 1;
                    font-size: 14px;
                    color: #333;
                }
                
                .error-notification__close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #666;
                    margin-left: 8px;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }
    }
    
    // ===== GLOBAL ERROR HANDLING =====
    
    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, { type: 'unhandledRejection' });
            event.preventDefault();
        });
        
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, { type: 'uncaughtError' });
        });
        
        // Handle fetch errors globally
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response;
            } catch (error) {
                this.handleError(error, { type: 'fetch', url: args[0] });
                throw error;
            }
        };
    }
    
    // ===== DEBUGGING HELPERS =====
    
    getStoredErrors() {
        try {
            return JSON.parse(localStorage.getItem('appErrors') || '[]');
        } catch (e) {
            return [];
        }
    }
    
    clearStoredErrors() {
        localStorage.removeItem('appErrors');
    }
    
    exportErrors() {
        const errors = this.getStoredErrors();
        const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `app-errors-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Create global instance
window.errorHandler = new ErrorHandler();

// Setup global error handling
window.errorHandler.setupGlobalErrorHandling();
