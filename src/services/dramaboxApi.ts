interface BaseResponseSuccess<T> {
  status: 0;
  message: string;
  timestamp: number;
  success: true;
  data: T;
}

interface BaseResponseError {
  status: number;
  message: string;
  timestamp: number;
  success: false;
  data: null;
}

type BaseResponse<T> = BaseResponseSuccess<T> | BaseResponseError;

export interface Book {
  bookId: string;
  bookName?: string;
  cover?: string;
  viewCount?: number;
  followCount?: number;
  introduction?: string;
  chapterCount?: number;
  labels?: string[];
  tags?: string[];
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

const headers = {
  accept: "application/json, text/plain, */*",
  "accept-encoding": "gzip, deflate, br, zstd",
  "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,id;q=0.7",
  "android-id": "ffffffff9b5bfe16000000000",
  apn: "1",
  brand: "Xiaomi",
  cid: "DAUAF1064291",
  "content-type": "application/json; charset=UTF-8",
  "current-language": "in",
  "device-id": "ee9d23ac-0596-4f3e-8279-b652c9c2b7f0",
  language: "in",
  md: "Redmi Note 8",
  mf: "XIAOMI",
  origin: "https://dramabox.drama.web.id",
  ov: "9",
  "over-flow": "new-fly",
  p: "48",
  "package-name": "com.storymatrix.drama",
  priority: "u=1, i",
  referer: "https://dramabox.drama.web.id/",
  "time-zone": "+0700",
  tn: "Bearer ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SnlaV2RwYzNSbGNsUjVjR1VpT2lKVVJVMVFJaXdpZFhObGNrbGtJam96TXpZd09EUXdOVFo5LkFLMWw0d01Ud00xVndOTHBOeUlOcmtHN3dmb0czaGROMEgxNWVPZV9KaHc=",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "user-id": "336084056",
  version: "470",
  vn: "4.7.0",
};

export class DramaboxAPI {
  private headers: Record<string, string> = headers;

  async getSignature(
    payload: Record<string, unknown>
  ): Promise<{ signature: string; timestamp: number }> {
    const timestamp = Date.now();
    const deviceId = this.headers["device-id"];
    const androidId = this.headers["android-id"];
    const tn = this.headers["tn"];
    const strPayload = `timestamp=${timestamp}${JSON.stringify(
      payload
    )}${deviceId}${androidId}${tn}`;
    const signReqBody = { str: strPayload };

    const res = await fetch(`https://dramabox-api.d5studio.site/sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Origin: "https://dramabox.drama.web.id",
      },
      body: JSON.stringify(signReqBody),
    });

    if (!res.ok) throw new Error(`sign request failed: ${res.status}`);
    const response = (await res.json()) as {
      success: number;
      signature: string;
    };
    
    if (!response.success) throw new Error("sign endpoint returned success=false");
    return { signature: response.signature as string, timestamp };
  }

  async searchBook(keyword: string): Promise<SearchResult> {
    const payload = {
      searchSource: "搜索按钮",
      pageNo: 1,
      pageSize: 100,
      from: "search_sug",
      keyword,
    };
    const { signature, timestamp } = await this.getSignature(payload);
    const res = await fetch(
      `https://dramabox-api.d5studio.site/proxy.php/drama-box/search/search?timestamp=${timestamp}`,
      {
        method: "POST",
        headers: { ...this.headers, sn: signature },
        body: JSON.stringify(payload),
      }
    );

    const response = (await res.json()) as BaseResponse<SearchResult>;
    if (!response.success) throw new Error(response.message);
    return response.data;
  }

  async getBookDetail(id: string): Promise<BookDetail> {
    const res = await fetch(
      `https://www.webfic.com/webfic/book/detail/v2?id=${id}&tlanguage=in`,
      {
        method: "GET",
      }
    );

    const response = (await res.json()) as BaseResponse<BookDetail>;
    if (!response.success) throw new Error(response.message);
    return response.data;
  }

  async batchUnlockEpisode(
    bookId: string,
    chapterIdList: string[]
  ): Promise<UnlockBookDetail> {
    const payload = {
      bookId: bookId,
      chapterIdList: chapterIdList,
    };

    const { signature, timestamp } = await this.getSignature(payload);
    const res = await fetch(
      `https://dramabox-api.d5studio.site/proxy.php/drama-box/chapterv2/batchDownload?timestamp=${timestamp}`,
      {
        method: "POST",
        headers: { ...this.headers, sn: signature },
        body: JSON.stringify(payload),
      }
    );
    const response = (await res.json()) as BaseResponse<UnlockBookDetail>;
    if (!response.success) {
      // Create a custom error with the API message
      const error = new Error(response.message);
      error.name = 'UnlockError';
      throw error;
    }
    return response.data;
  }

  async getChapterVideoUrl(
    bookId: string,
    chapterId: string,
    quality?: number
  ): Promise<{ url: string; quality: number } | null> {
    try {
      const detail = await this.getBookDetail(bookId);
      const chapters = detail.chapterList.map((chapter) => chapter.id);
      const unlocked = await this.batchUnlockEpisode(bookId, chapters);

      const chapter = unlocked.chapterVoList.find(
        (ch) => ch.chapterId === chapterId
      );

      if (!chapter || chapter.cdnList.length === 0) {
        return null;
      }

      let mp4Url = null;
      let qualitySelected = null;

      if (quality) {
        for (const cdn of chapter.cdnList) {
          const videoPathList = cdn.videoPathList;
          const correctQuality = videoPathList.find(
            (path) => path.quality === quality
          );
          if (correctQuality) {
            mp4Url = correctQuality.videoPath;
            qualitySelected = correctQuality.quality;
            break;
          }
        }
      } else {
        for (const cdn of chapter.cdnList) {
          mp4Url = cdn.videoPathList[0]?.videoPath ?? null;
          qualitySelected = cdn.videoPathList[0]?.quality ?? null;
          break;
        }
      }

      if (!mp4Url) {
        return null;
      }

      return { url: mp4Url, quality: qualitySelected || 0 };
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
      const detail = await this.getBookDetail(bookId);
      const chapters = detail.chapterList.map((chapter) => chapter.id);
      const unlocked = await this.batchUnlockEpisode(bookId, chapters);

      const sortedChapters = unlocked.chapterVoList.sort(
        (a, b) => a.chapterIndex - b.chapterIndex
      );

      const chapterList = [];
      for (const chapter of sortedChapters) {
        if (chapter.cdnList.length === 0) {
          continue;
        }
        let mp4Url = null;
        let qualitySelected = null;
        if (quality) {
          for (const cdn of chapter.cdnList) {
            const videoPathList = cdn.videoPathList;
            const correctQuality = videoPathList.find(
              (path) => path.quality === quality
            );
            if (correctQuality) {
              mp4Url = correctQuality.videoPath;
              qualitySelected = correctQuality.quality;
              break;
            }
          }
        } else {
          for (const cdn of chapter.cdnList) {
            mp4Url = cdn.videoPathList[0]?.videoPath ?? null;
            qualitySelected = cdn.videoPathList[0]?.quality ?? null;
            break;
          }
        }
        if (!mp4Url) {
          continue;
        }
        chapterList.push({
          chapterIndex: chapter.chapterIndex,
          chapterId: chapter.chapterId,
          mp4Url: mp4Url,
          qualitySelected: qualitySelected || 0,
        });
      }

      return chapterList;
    } catch {
      return [];
    }
  }
}

export const dramaboxApi = new DramaboxAPI();

