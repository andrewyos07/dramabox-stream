export interface Book {
  bookId: string;
  bookName?: string;
  cover?: string;
  coverWap?: string;
  viewCount?: number;
  followCount?: number;
  introduction?: string;
  chapterCount?: number;
  labels?: string[];
  tags?: string[];
  playCount?: string;
  typeTwoIds?: number[];
  typeTwoNames?: string[];
  typeTwoList?: {
    id: number;
    name: string;
    replaceName: string;
  }[];
  language?: string;
  typeTwoName?: string;
  simpleLanguage?: string;
  bookNameEn?: string;
  bookNameLower?: string;
  shelfTime?: string;
  firstShelfTime?: string;
  // Alternative field names from search results
  title?: string;
  authorName?: string;
  id?: string;
}

export interface ChapterItem {
  id: string;
  name: string;
  index: number;
  indexStr: string;
  unlock: boolean;
  mp4?: string;
  m3u8Url?: string;
  m3u8Flag?: boolean;
  cover: string;
  utime: string;
  chapterPrice: number;
  duration: number;
  new: boolean;
}

export interface BookDetail {
  book: Book;
  recommends: Book[];
  chapterList: ChapterItem[];
  languages: string[];
  firstLanguage: string;
  articleList: unknown[];
  sourceBookId: string;
}

export interface UnlockVideoPath {
  quality: number;
  videoPath: string;
  isDefault: number;
  isEntry: number;
  isVipEquity: number;
}

export interface UnlockCdn {
  cdnDomain: string;
  isDefault: number;
  videoPathList: UnlockVideoPath[];
}

export interface UnlockChapterItem {
  chapterId: string;
  chapterIndex: number;
  isCharge: number;
  chapterName: string;
  cdnList: UnlockCdn[];
  chapterImg: string;
  chapterType: number;
  needInterstitialAd: number;
  viewingDuration: number;
  chargeChapter: boolean;
}

export interface UnlockBookDetail {
  chapterVoList: UnlockChapterItem[];
  bookName: string;
  bookCover: string;
  introduction: string;
}

export interface SearchResult {
  searchList?: Book[];
}

export interface StreamChapter {
  chapterId: string;
  chapterIndex: number;
  chapterName: string;
  videoUrl?: string;
  videoUrls?: Array<{
    quality: number;
    url: string;
  }>;
  cover?: string;
  duration?: number;
}

export interface StreamResponse {
  success?: boolean;
  data?: {
    chapters?: StreamChapter[];
  };
  chapters?: StreamChapter[];
}

const API_BASE = '/api/dramabox';

export class DramaboxAPI {
  async getForYou(): Promise<Book[]> {
    const res = await fetch(`${API_BASE}/foryou`);
    if (!res.ok) throw new Error('Failed to fetch For You');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async getLatest(): Promise<Book[]> {
    const res = await fetch(`${API_BASE}/latest`);
    if (!res.ok) throw new Error('Failed to fetch Latest');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async getTrending(): Promise<Book[]> {
    const res = await fetch(`${API_BASE}/trending`);
    if (!res.ok) throw new Error('Failed to fetch Trending');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async getPopular(): Promise<Book[]> {
    const res = await fetch(`${API_BASE}/populersearch`);
    if (!res.ok) throw new Error('Failed to fetch Popular');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async searchBook(keyword: string): Promise<SearchResult> {
    const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(keyword)}`);
    if (!res.ok) throw new Error('Failed to search');
    const data = await res.json();
    return { searchList: Array.isArray(data) ? data : [] };
  }

  async getAllEpisodes(bookId: string, useCache = true): Promise<StreamResponse> {
    // Check cache first
    if (useCache && typeof window !== 'undefined') {
      const cacheKey = `episodes_${bookId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const cacheTime = parsed.timestamp || 0;
          const CACHE_TTL = 1000 * 60 * 10; // 10 minutes
          if (Date.now() - cacheTime < CACHE_TTL) {
            console.log(`Using cached episodes for bookId: ${bookId}`);
            return parsed.data;
          }
        } catch {
          // Invalid cache, continue to fetch
        }
      }
    }

    const url = `${API_BASE}/allepisode?bookId=${bookId}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      if (res.status === 404) {
        console.warn(`All episodes API endpoint not available for bookId: ${bookId}`);
        return { chapters: [] };
      }
      const errorText = await res.text();
      console.error(`All episodes API error (${res.status}):`, url, errorText);
      throw new Error(`Failed to fetch episodes: ${res.status} ${res.statusText}`);
    }
    
    try {
      const data = await res.json();
      // Handle different response formats
      const chapterList = data.chapters || data.data?.chapters || (Array.isArray(data) ? data : []);
      
      const chapters: StreamChapter[] = chapterList.map((ch: {
        chapterId?: string;
        chapterIndex?: number;
        chapterName?: string;
        chapterImg?: string;
        cover?: string;
        viewingDuration?: number;
        duration?: number;
        videoUrl?: string;
        videoUrls?: Array<{
          quality?: number;
          url?: string;
        }>;
        cdnList?: Array<{
          videoPathList?: Array<{
            quality?: number;
            videoPath?: string;
          }>;
        }>;
      }) => {
        // If already in correct format
        if (ch.videoUrl || ch.videoUrls) {
          return {
            chapterId: ch.chapterId || '',
            chapterIndex: ch.chapterIndex || 0,
            chapterName: ch.chapterName || '',
            videoUrl: ch.videoUrl,
            videoUrls: ch.videoUrls,
            cover: ch.cover || ch.chapterImg || '',
            duration: ch.duration || ch.viewingDuration || 0,
          };
        }

        // Transform from cdnList format
        const cdnList = ch.cdnList || [];
        const videoUrls: Array<{ quality: number; url: string }> = [];
        
        cdnList.forEach((cdn) => {
          if (cdn.videoPathList) {
            cdn.videoPathList.forEach((vp) => {
              if (vp.videoPath) {
                videoUrls.push({
                  quality: vp.quality || 720,
                  url: vp.videoPath,
                });
              }
            });
          }
        });

        return {
          chapterId: ch.chapterId || '',
          chapterIndex: ch.chapterIndex || 0,
          chapterName: ch.chapterName || '',
          videoUrl: videoUrls[0]?.url,
          videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
          cover: ch.cover || ch.chapterImg || '',
          duration: ch.duration || ch.viewingDuration || 0,
        };
      });

      const result = { chapters };
      
      // Cache the result
      if (useCache && typeof window !== 'undefined') {
        try {
          const cacheKey = `episodes_${bookId}`;
          sessionStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: result,
          }));
        } catch {
          // Cache failed, continue
        }
      }

      return result;
    } catch (error) {
      console.error('Failed to parse episodes response:', error);
      return { chapters: [] };
    }
  }

  async getStream(bookId: string): Promise<StreamResponse> {
    // Use getAllEpisodes instead
    return this.getAllEpisodes(bookId);
  }

  async getBookDetail(id: string, includeEpisodes = false): Promise<BookDetail> {
    // Get book info from foryou/latest/trending/popular first
    let book: Book | null = null;
    try {
      const [foryou, latest, trending, popular] = await Promise.all([
        this.getForYou().catch(() => []),
        this.getLatest().catch(() => []),
        this.getTrending().catch(() => []),
        this.getPopular().catch(() => []),
      ]);
      
      const allBooks = [...foryou, ...latest, ...trending, ...popular];
      book = allBooks.find(b => b.bookId === id) || null;
      
      // Normalize book data to ensure cover image is available
      if (book) {
        const rawBook = book as Book & Record<string, unknown>;
        const coverImage = 
          book.cover || 
          book.coverWap || 
          (rawBook.coverImage as string | undefined) || 
          (rawBook.img as string | undefined) || 
          (rawBook.image as string | undefined) || 
          (rawBook.poster as string | undefined) || 
          (rawBook.thumbnail as string | undefined) ||
          '';
        
        book = {
          ...book,
          cover: coverImage,
          coverWap: coverImage,
        };
        
        // Log for debugging if cover is missing
        if (!coverImage) {
          console.warn(`No cover image found for book ${id}:`, {
            bookId: book.bookId,
            availableFields: Object.keys(rawBook).filter(k => 
              k.toLowerCase().includes('cover') || 
              k.toLowerCase().includes('img') || 
              k.toLowerCase().includes('image') ||
              k.toLowerCase().includes('poster')
            ),
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch book info:', error);
    }

    if (!book) {
      throw new Error(`Book with ID ${id} not found`);
    }

    // Only get episodes if explicitly requested (for backward compatibility)
    // Otherwise, return empty chapterList - episodes will be loaded separately
    let chapters: StreamChapter[] = [];
    if (includeEpisodes) {
      try {
        const streamData = await this.getAllEpisodes(id, false); // Don't use cache for initial load
        chapters = streamData.chapters || [];
      } catch (error) {
        console.warn('Failed to fetch episodes data, using empty chapters:', error);
        // Continue with empty chapters - we'll show the book info at least
      }
    }

    const chapterList: ChapterItem[] = chapters.map((ch, index) => ({
      id: ch.chapterId,
      name: ch.chapterName,
      index: ch.chapterIndex || index + 1,
      indexStr: String(ch.chapterIndex || index + 1),
      unlock: true,
      mp4: ch.videoUrl || ch.videoUrls?.[0]?.url,
      m3u8Url: ch.videoUrl || ch.videoUrls?.[0]?.url,
      m3u8Flag: true,
      cover: ch.cover || book.cover || book.coverWap || '',
      utime: '',
      chapterPrice: 0,
      duration: ch.duration || 0,
      new: false,
    }));

    return {
      book,
      recommends: [],
      chapterList,
      languages: ['in'],
      firstLanguage: 'in',
      articleList: [],
      sourceBookId: id,
    };
  }

  async batchUnlockEpisode(
    bookId: string,
    chapterIdList: string[]
  ): Promise<UnlockBookDetail> {
    const streamData = await this.getAllEpisodes(bookId);
    const chapters = streamData.chapters || [];
    
    const chapterVoList: UnlockChapterItem[] = chapters
      .filter(ch => chapterIdList.includes(ch.chapterId))
      .map((ch) => ({
        chapterId: ch.chapterId,
        chapterIndex: ch.chapterIndex,
        isCharge: 0,
        chapterName: ch.chapterName,
        cdnList: ch.videoUrls ? [{
          cdnDomain: '',
          isDefault: 1,
          videoPathList: ch.videoUrls.map(v => ({
            quality: v.quality,
            videoPath: v.url,
            isDefault: v.quality === ch.videoUrls?.[0]?.quality ? 1 : 0,
            isEntry: 0,
            isVipEquity: 0,
          })),
        }] : [],
        chapterImg: ch.cover || '',
        chapterType: 0,
        needInterstitialAd: 0,
        viewingDuration: ch.duration || 0,
        chargeChapter: false,
      }));

    return {
      chapterVoList,
      bookName: '',
      bookCover: '',
      introduction: '',
    };
  }

  async getChapterVideoUrl(
    bookId: string,
    chapterId: string,
    quality?: number
  ): Promise<{ url: string; quality: number } | null> {
    try {
      const streamData = await this.getAllEpisodes(bookId);
      const chapters = streamData.chapters || [];
      const chapter = chapters.find(ch => ch.chapterId === chapterId);
      
      if (!chapter) return null;

      if (chapter.videoUrl) {
        return { url: chapter.videoUrl, quality: quality || 720 };
      }

      if (chapter.videoUrls && chapter.videoUrls.length > 0) {
        const selectedVideo = quality 
          ? chapter.videoUrls.find(v => v.quality === quality)
          : chapter.videoUrls[0];
        
        if (selectedVideo) {
          return { url: selectedVideo.url, quality: selectedVideo.quality };
        }
      }

        return null;
    } catch {
      return null;
    }
  }

  async getAllChapterUrls(
    bookId: string,
    quality?: number
  ): Promise<
    Array<{
      chapterIndex: number;
      chapterId: string;
      mp4Url: string;
      qualitySelected: number;
    }>
  > {
    try {
      const streamData = await this.getAllEpisodes(bookId);
      const chapters = streamData.chapters || [];
      
      return chapters.map((ch) => {
        const videoUrl = ch.videoUrl || ch.videoUrls?.[0]?.url || '';
        const selectedQuality = quality || ch.videoUrls?.[0]?.quality || 720;
        
        return {
          chapterIndex: ch.chapterIndex,
          chapterId: ch.chapterId,
          mp4Url: videoUrl,
          qualitySelected: selectedQuality,
        };
      });
    } catch {
      return [];
    }
  }
}

export const dramaboxApi = new DramaboxAPI();
