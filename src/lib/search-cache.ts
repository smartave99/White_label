/**
 * Search Cache
 * 
 * In-memory cache with TTL for search-related data.
 * Reduces Firebase calls by caching products and categories.
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface SearchCacheOptions {
    ttlMs?: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

class SearchCache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private defaultTtlMs: number;

    constructor(options: SearchCacheOptions = {}) {
        this.defaultTtlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    }

    /**
     * Get a cached value
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set a cached value
     */
    set<T>(key: string, data: T, ttlMs?: number): void {
        const now = Date.now();
        const ttl = ttlMs ?? this.defaultTtlMs;

        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttl,
        });
    }

    /**
     * Check if a key exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Delete a specific key
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all cached data
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Clear all entries matching a prefix
     */
    clearPrefix(prefix: string): void {
        const keysToDelete: string[] = [];
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Get cache statistics
     */
    getStats(): { size: number; keys: string[] } {
        // Clean expired entries first
        const now = Date.now();
        for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }

        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Singleton instance
let cacheInstance: SearchCache | null = null;

export function getSearchCache(): SearchCache {
    if (!cacheInstance) {
        cacheInstance = new SearchCache();
    }
    return cacheInstance;
}

// Cache key generators
export const CacheKeys = {
    allProducts: () => "products:all",
    productsByCategory: (categoryId: string) => `products:category:${categoryId}`,
    availableProducts: () => "products:available",
    categories: () => "categories:all",
    queryResults: (queryHash: string) => `query:${queryHash}`,
};

/**
 * Simple hash function for query strings
 */
export function hashQuery(query: string): string {
    let hash = 0;
    const normalized = query.toLowerCase().trim();
    for (let i = 0; i < normalized.length; i++) {
        const char = normalized.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}

export { SearchCache };
