/**
 * Simple In-Memory Caching Utility
 */

class Cache {
  constructor(ttlSeconds = 3600) {
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  del(key) {
    this.cache.delete(key);
  }

  flush() {
    this.cache.clear();
  }
}

// Global cache instances
const contentCache = new Cache(300); // 5 minutes
const settingsCache = new Cache(600); // 10 minutes

module.exports = {
  contentCache,
  settingsCache
};
