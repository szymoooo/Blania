/* ========================================
   PERFORMANCE OPTIMIZER
   Optymalizacja wydajności aplikacji
   ======================================== */

class PerformanceOptimizer {
    constructor() {
        this.imageCache = new Map();
        this.lazyLoadObserver = null;
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
    }

    // ===== IMAGE OPTIMIZATION =====
    
    optimizeImages() {
        // Convert PNG to WebP if supported
        this.convertImagesToWebP();
        
        // Implement lazy loading
        this.setupLazyLoading();
        
        // Preload critical images
        this.preloadCriticalImages();
    }
    
    convertImagesToWebP() {
        if (!this.supportsWebP()) return;
        
        const images = document.querySelectorAll('img[src$=".png"]');
        images.forEach(img => {
            const webpSrc = img.src.replace('.png', '.webp');
            this.preloadImage(webpSrc).then(() => {
                img.src = webpSrc;
            }).catch(() => {
                // Fallback to original PNG if WebP fails
                console.log('WebP not available, using PNG');
            });
        });
    }
    
    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.lazyLoadObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            // Observe all images with data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                this.lazyLoadObserver.observe(img);
            });
        }
    }
    
    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            this.preloadImage(src).then(() => {
                img.src = src;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
            }).catch(() => {
                img.classList.add('error');
            });
        }
    }
    
    preloadImage(src) {
        if (this.imageCache.has(src)) {
            return Promise.resolve(this.imageCache.get(src));
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.imageCache.set(src, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    }
    
    preloadCriticalImages() {
        const criticalImages = [
            'BAT Sierakowice.png',
            'match.png',
            'training.png',
            'physio.png'
        ];
        
        criticalImages.forEach(src => {
            this.preloadImage(src).catch(console.warn);
        });
    }
    
    // ===== DEBOUNCE AND THROTTLE =====
    
    debounce(func, delay, key = 'default') {
        return (...args) => {
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            
            const timer = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);
            
            this.debounceTimers.set(key, timer);
        };
    }
    
    throttle(func, delay, key = 'default') {
        return (...args) => {
            if (this.throttleTimers.has(key)) {
                return;
            }
            
            func.apply(this, args);
            
            const timer = setTimeout(() => {
                this.throttleTimers.delete(key);
            }, delay);
            
            this.throttleTimers.set(key, timer);
        };
    }
    
    // ===== ASYNC OPERATIONS =====
    
    async loadDataAsync(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }
    
    async batchProcess(items, processor, batchSize = 5) {
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchPromises = batch.map(item => processor(item));
            
            try {
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
                
                // Small delay between batches to prevent overwhelming
                if (i + batchSize < items.length) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            } catch (error) {
                console.error('Batch processing error:', error);
                // Continue with next batch
            }
        }
        
        return results;
    }
    
    // ===== MEMORY MANAGEMENT =====
    
    cleanupMemory() {
        // Clear old image cache entries
        if (this.imageCache.size > 50) {
            const entries = Array.from(this.imageCache.entries());
            const toDelete = entries.slice(0, 25);
            toDelete.forEach(([key]) => this.imageCache.delete(key));
        }
        
        // Clear old timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        
        this.throttleTimers.forEach(timer => clearTimeout(timer));
        this.throttleTimers.clear();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }
    
    // ===== PERFORMANCE MONITORING =====
    
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`${name} took ${end - start} milliseconds`);
        
        // Store performance metrics
        this.storePerformanceMetric(name, end - start);
        
        return result;
    }
    
    async measureAsyncPerformance(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        
        console.log(`${name} took ${end - start} milliseconds`);
        
        this.storePerformanceMetric(name, end - start);
        
        return result;
    }
    
    storePerformanceMetric(name, duration) {
        const metrics = JSON.parse(localStorage.getItem('performanceMetrics') || '{}');
        if (!metrics[name]) {
            metrics[name] = [];
        }
        
        metrics[name].push({
            duration,
            timestamp: Date.now()
        });
        
        // Keep only last 100 measurements
        if (metrics[name].length > 100) {
            metrics[name] = metrics[name].slice(-100);
        }
        
        localStorage.setItem('performanceMetrics', JSON.stringify(metrics));
    }
    
    getPerformanceMetrics() {
        return JSON.parse(localStorage.getItem('performanceMetrics') || '{}');
    }
    
    // ===== RESOURCE OPTIMIZATION =====
    
    optimizeDOM() {
        // Remove unused event listeners
        this.cleanupEventListeners();
        
        // Optimize CSS
        this.optimizeCSS();
        
        // Minimize reflows
        this.batchDOMUpdates();
    }
    
    cleanupEventListeners() {
        // This would need to be implemented with the event handler system
        console.log('Event listeners cleanup - implement with event handler system');
    }
    
    optimizeCSS() {
        // Add critical CSS inline
        this.inlineCriticalCSS();
        
        // Defer non-critical CSS
        this.deferNonCriticalCSS();
    }
    
    inlineCriticalCSS() {
        const criticalCSS = `
            body { font-family: 'Roboto', sans-serif; margin: 0; padding: 0; }
            .form-container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .stats-section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
    }
    
    deferNonCriticalCSS() {
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        nonCriticalCSS.forEach(link => {
            link.media = 'print';
            link.onload = function() {
                this.media = 'all';
            };
        });
    }
    
    batchDOMUpdates() {
        // Use DocumentFragment for batch updates
        const fragment = document.createDocumentFragment();
        
        // This would be used in functions that add multiple elements
        return fragment;
    }
    
    // ===== INITIALIZATION =====
    
    initialize() {
        // Optimize images
        this.optimizeImages();
        
        // Optimize DOM
        this.optimizeDOM();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Setup memory cleanup
        this.setupMemoryCleanup();
    }
    
    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    }
                    if (entry.entryType === 'layout-shift') {
                        console.log('CLS:', entry.value);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        }
    }
    
    setupMemoryCleanup() {
        // Cleanup memory every 5 minutes
        setInterval(() => {
            this.cleanupMemory();
        }, 5 * 60 * 1000);
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanupMemory();
        });
    }
}

// Create global instance
window.performanceOptimizer = new PerformanceOptimizer();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer.initialize();
});
