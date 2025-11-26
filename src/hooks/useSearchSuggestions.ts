import { useEffect, useState } from 'react';
import type { Book } from '../services/dramaboxApi';
import { dramaboxApi } from '../services/dramaboxApi';
import { normalizeBookData } from '../utils/dramaData';

const DEBOUNCE_MS = 300;

export function useSearchSuggestions(keyword: string, limit = 6) {
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const result = await dramaboxApi.searchBook(trimmed);
        const searchList = (result.searchList ?? []) as Book[];
        const normalized = searchList.map(normalizeBookData).slice(0, limit);
        if (active) {
          setSuggestions(normalized);
        }
      } catch {
        if (active) {
          setSuggestions([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [keyword, limit]);

  return { suggestions, isLoading };
}


