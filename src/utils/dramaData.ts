import type { Book } from '../services/dramaboxApi';
import { dramaboxApi } from '../services/dramaboxApi';

export const normalizeBookData = (item: Book): Book => ({
  ...item,
  bookId: item.bookId || item.id || '',
  bookName: item.bookName || item.title || 'Untitled',
});

const keywordCache = new Map<string, Book[]>();
const bookDetailViewCache = new Map<string, number>();

const CACHE_PREFIX = 'dramabox-cache';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const detailCacheTTL = 1000 * 60 * 10; // 10 minutes
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const storageAvailable = typeof window !== 'undefined' && 'sessionStorage' in window;

const getCacheKey = (type: string, identifier: string) => `${CACHE_PREFIX}:${type}:${identifier}`;

const readFromStorageCache = <T>(key: string, ttl = CACHE_TTL): T | null => {
  if (!storageAvailable) return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { value: T; timestamp: number };
    if (Date.now() - parsed.timestamp > ttl) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch {
    return null;
  }
};

const writeToStorageCache = <T>(key: string, value: T) => {
  if (!storageAvailable) return;
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        value,
      })
    );
  } catch {
    // Ignore quota errors
  }
};

const fetchKeywordResults = async (keyword: string, maxRetries = 2) => {
  const lowered = keyword.toLowerCase();
  if (keywordCache.has(lowered)) {
    return keywordCache.get(lowered)!;
  }

  const storageKey = getCacheKey('keyword', lowered);
  const cached = readFromStorageCache<Book[]>(storageKey);
  if (cached) {
    keywordCache.set(lowered, cached);
    return cached;
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await dramaboxApi.searchBook(keyword);
      const searchList = (result.searchList ?? []) as Book[];
      const normalized = searchList.map(normalizeBookData);
      keywordCache.set(lowered, normalized);
      writeToStorageCache(storageKey, normalized);
      return normalized;
    } catch (error) {
      if (attempt === maxRetries) {
        keywordCache.set(lowered, []);
        writeToStorageCache(storageKey, []);
        return [];
      }
      const backoff = 250 * (attempt + 1);
      await delay(backoff);
    }
  }
};

export const fetchDramasByKeywords = async (keywords: string[], limit: number) => {
  const uniqueKeywords = Array.from(new Set(keywords.map((keyword) => keyword.toLowerCase())));
  const keywordPromises = uniqueKeywords.map((keyword) => fetchKeywordResults(keyword));
  const results = await Promise.all(keywordPromises);

  const collected: Book[] = [];
  const seen = new Set<string>();

  for (const items of results) {
    for (const item of items) {
      const uniqueId = item.bookId || item.id;
      if (!uniqueId || seen.has(uniqueId)) continue;

      collected.push(item);
      seen.add(uniqueId);

      if (collected.length >= limit) {
        return collected;
      }
    }
  }

  return collected.slice(0, limit);
};

export const enrichBooksWithViewCounts = async (books: Book[], batchSize = 10) => {
  const enriched = [...books];

  for (let i = 0; i < books.length; i += batchSize) {
    const batch = books.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (book, index) => {
        if ((book.viewCount ?? 0) > 0) {
          return;
        }

        const id = book.bookId || book.id;
        if (!id) {
          return;
        }

        // Check memory cache first
        if (bookDetailViewCache.has(id)) {
          enriched[i + index] = {
            ...book,
            viewCount: bookDetailViewCache.get(id) ?? book.viewCount ?? 0,
          };
          return;
        }

        const storageKey = getCacheKey('viewCount', id);
        const cachedViews = readFromStorageCache<number>(storageKey, detailCacheTTL);
        if (cachedViews != null) {
          bookDetailViewCache.set(id, cachedViews);
          enriched[i + index] = {
            ...book,
            viewCount: cachedViews,
          };
          return;
        }

        try {
          const detail = await dramaboxApi.getBookDetail(id);
          const updated = detail.book;
          const viewCount = updated.viewCount ?? book.viewCount ?? 0;
          bookDetailViewCache.set(id, viewCount);
          writeToStorageCache(storageKey, viewCount);
          enriched[i + index] = {
            ...book,
            viewCount,
          };
        } catch {
          // Ignore failures for individual books
        }
      })
    );
  }

  return enriched;
};

