import crypto from "crypto";

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

interface Book {
  bookId: string;
  bookName: string;
  cover: string;
  viewCount: number;
  followCount: number;
  introduction: string;
  chapterCount: number;
  labels: string[];
  tags: string[];
  typeTwoIds: number[];
  typeTwoNames: string[];
  typeTwoList: {
    id: number;
    name: string;
    replaceName: string;
  }[];
  language: string;
  typeTwoName: string;
  simpleLanguage: string;
  bookNameEn: string;
  bookNameLower: string;
  shelfTime: string;
  firstShelfTime: string;
}

interface ChapterItem {
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

interface BookDetail {
  book: Book;
  recommends: Book[];
  chapterList: ChapterItem[];
  languages: string[];
  firstLanguage: string;
  articleList: unknown[];
  sourceBookId: string;
}

interface UnlockVideoPath {
  quality: number;
  videoPath: string;
  isDefault: number;
  isEntry: number;
  isVipEquity: number;
}

interface UnlockCdn {
  cdnDomain: string;
  isDefault: number;
  videoPathList: UnlockVideoPath[];
}

interface UnlockChapterItem {
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

interface UnlockBookDetail {
  chapterVoList: UnlockChapterItem[];
  bookName: string;
  bookCover: string;
  introduction: string;
}

interface SearchResult {
  searchList?: Book[];
}

// Local RSA signing implementation from sc-dramabox
function decodeString(str = ""): string {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c >= 33 && c <= 126) {
      // printable ASCII
      c -= 20;
      if (c < 33) c += 126 - 33;
    }
    result += String.fromCharCode(c);
  }
  return result;
}

class DramaboxApp {
  private static privateKey: crypto.KeyObject | null = null;

  private static initPrivateKey(): void {
    try {
      const part1 =
        "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9Q4Y5QX5j08HrnbY3irfKdkEllAU2OORnAjlXDyCzcm2Z6ZRrGvtTZUAMelfU5PWS6XGEm3d4kJEKbXi4Crl8o2E/E3YJPk1lQD1d0JTdrvZleETN1ViHZFSQwS3L94Woh0E3TPebaEYq88eExvKu1tDdjSoFjBbgMezySnas5Nc2xF28";
      const part2 = decodeString(
        `l|d,WL$EI,?xyw+*)^#?U\`[whXlG\`-GZif,.jCxbKkaY"{w*y]_jax^/1iVDdyg(Wbz+z/$xVjCiH0lZf/d|%gZglW)"~J,^~}w"}m(E'eEunz)eyEy\`XGaVF|_(Kw)|awUG"'{{e#%$0E.ffHVU++$giHzdvC0ZLXG|U{aVUUYW{{YVU^x),J'If\`nG|C[\`ZF),xLv(-H'}ZIEyCfke0dZ%aU[V)"V0}mhKvZ]Gw%-^a|m'\`\\f}{(~kzi&zjG+|fXX0$IH#j\`+hfnME"|fa/{.j.xf,"LZ.K^bZy%c.W^/v{x#(J},Ua,ew#.##K(ki)$LX{a-1\\MG/zL&JlEKEw'Hg|D&{EfuKYM[nGKx1V#lFu^V_LjVzw+n%+,Xd`
      );
      const part3 =
        "x52e71nafqfbjXxZuEtpu92oJd6A9mWbd0BZTk72ZHUmDcKcqjfcEH19SWOphMJFYkxU5FRoIEr3/zisyTO4Mt33ZmwELOrY9PdlyAAyed7ZoH+hlTr7c025QROvb2LmqgRiUT56tMECgYEA+jH5m6iMRK6XjiBhSUnlr3DzRybwlQrtIj5sZprWe2my5uYHG3jbViYIO7GtQvMTnDrBCxNhuM6dPrL0cRnbsp/iBMXe3pyjT/aWveBkn4R+UpBsnbtDn28r1MZpCDtr5UNc0TPj4KFJvjnV/e8oGoyYEroECqcw1LqNOGDiLhkCgYEAwaemNePYrXW+MVX/hatfLQ96tpxwf7yuHdENZ2q5AFw73GJWYvC8VY+TcoKPAmeoCUMltI3TrS6K5Q/GoLd5K2BsoJrSxQNQFd3ehWAtdOuPDvQ5rn/2fsvgvc3rOvJh7uNnwEZCI/45WQg+UFWref4PPc+ArNtp9Xj2y7LndwkCgYARojIQeXmhYZjG6JtSugWZLuHGkwUDzChYcIPd";
      const part4 =
        "W25gdluokG/RzNvQn4+W/XfTryQjr7RpXm1VxCIrCBvYWNU2KrSYV4XUtL+B5ERNj6In6AOrOAifuVITy5cQQQeoD+AT4YKKMBkQfO2gnZzqb8+ox130e+3K/mufoqJPZeyrCQKBgC2fobjwhQvYwYY+DIUharri+rYrBRYTDbJYnh/PNOaw1CmHwXJt5PEDcml3+NlIMn58I1X2U/hpDrAIl3MlxpZBkVYFI8LmlOeR7ereTddN59ZOE4jY/OnCfqA480Jf+FKfoMHby5lPO5OOLaAfjtae1FhrmpUe3EfIx9wVuhKBAoGBAPFzHKQZbGhkqmyPW2ctTEIWLdUHyO37fm8dj1WjN4wjRAI4ohNiKQJRh3QE11E1PzBTl9lZVWT8QtEsSjnrA/tpGr378fcUT7WGBgTmBRaAnv1P1n/Tp0TSvh5XpIhhMuxcitIgrhYMIG3GbP9JNAarxO/qPW6Gi0xWaF7il7Or";

      const fullPem = part1 + part2 + part3 + part4;
      const formattedKey = `-----BEGIN PRIVATE KEY-----\n${fullPem}\n-----END PRIVATE KEY-----`;

      DramaboxApp.privateKey = crypto.createPrivateKey({
        key: formattedKey,
        format: "pem",
      });
    } catch (err) {
      console.error("[dramaboxapp] Failed to initialize private key:", err);
    }
  }

  static sign(str: string): string | null {
    if (!DramaboxApp.privateKey) DramaboxApp.initPrivateKey();
    if (!DramaboxApp.privateKey) return null;
    try {
      const sign = crypto.createSign("RSA-SHA256");
      sign.update(str, "utf-8");
      const signature = sign.sign(DramaboxApp.privateKey);
      return signature.toString("base64");
    } catch (err) {
      console.error("[dramaboxapp] Sign error:", err);
      return null;
    }
  }

  static dramabox(str: string): string | null {
    return DramaboxApp.sign(str);
  }
}

const defaultHeaders = {
  "accept-encoding": "gzip",
  "active-time": "48610",
  "afid": "1765426707100-3399426610238547736",
  "android-id": "ffffffffbc03a54ebc03a54e00000000",
  "apn": "0",
  "brand": "vivo",
  "build": "Build/PQ3A.190705.09121607",
  "cid": "DAUAG1050238",
  "connection": "Keep-Alive",
  "content-type": "application/json; charset=UTF-8",
  "country-code": "ID",
  "current-language": "in",
  "device-id": "dab6c1c5-7248-4c54-898d-37f045b1acff",
  "device-score": "55",
  "host": "sapi.dramaboxdb.com",
  "ins": "1765426707269",
  "instanceid": "8f1ff8f305a5fe5a1a09cb6f0e6f1864",
  "is_emulator": "0",
  "is_root": "1",
  "is_vpn": "1",
  "language": "in",
  "lat": "0",
  "local-time": "2025-12-11 12:32:12.278 +0800",
  "locale": "in_ID",
  "mbid": "60000000000",
  "mcc": "510",
  "mchid": "DAUAG1050238",
  "md": "V2309A",
  "mf": "VIVO",
  "nchid": "DRA1000042",
  "ov": "9",
  "over-flow": "new-fly",
  "p": "51",
  "package-name": "com.storymatrix.drama",
  "pline": "ANDROID",
  "srn": "900x1600",
  "store-source": "store_google",
  "time-zone": "+0800",
  "tn":
    "Bearer ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SnlaV2RwYzNSbGNsUjVjR1VpT2lKUVJWSk5RVTVGVGxRaUxDSjFjMlZ5U1dRaU9qTTFNakl3T0RFeU4zMC5XSXBCc3Uyc2I5a2Q1enI5WmlBTDFqQWdxeDNFNVIzbkwtUnFkRzlmQ01F",
  "tz": "-480",
  "user-agent": "okhttp/4.10.0",
  "userid": "359546491",
  "version": "492",
  "vn": "4.9.2",
};

const headers = {
  ...defaultHeaders,
  tn: process.env.DRAMABOX_TN ?? defaultHeaders.tn,
  userid: process.env.DRAMABOX_USER_ID ?? defaultHeaders.userid,
  "device-id": process.env.DRAMABOX_DEVICE_ID ?? defaultHeaders["device-id"],
  "android-id":
    process.env.DRAMABOX_ANDROID_ID ?? defaultHeaders["android-id"],
  cid: process.env.DRAMABOX_CID ?? defaultHeaders.cid,
  brand: process.env.DRAMABOX_BRAND ?? defaultHeaders.brand,
  md: process.env.DRAMABOX_MODEL ?? defaultHeaders.md,
  mf: process.env.DRAMABOX_MANUFACTURER ?? defaultHeaders.mf,
  version: process.env.DRAMABOX_VERSION ?? defaultHeaders.version,
  vn: process.env.DRAMABOX_VERSION_NAME ?? defaultHeaders.vn,
};

export class DramaboxServerAPI {
  private headers: Record<string, string> = headers;

  private getSignature(payload: Record<string, unknown>): {
    signature: string;
    timestamp: number;
  } {
    const timestamp = Date.now();
    const deviceId = this.headers["device-id"];
    const androidId = this.headers["android-id"];
    const tn = this.headers["tn"];

    const strPayload = `timestamp=${timestamp}${JSON.stringify(
      payload
    )}${deviceId}${androidId}${tn}`;
    const signature = DramaboxApp.dramabox(strPayload);

    if (!signature) {
      throw new Error("Failed to generate signature");
    }

    return { signature, timestamp };
  }

  async searchBook(keyword: string): Promise<SearchResult> {
    const payload = {
      keyword,
    };
    const { signature, timestamp } = this.getSignature(payload);
    const body = JSON.stringify(payload);
    const res = await fetch(
      `https://sapi.dramaboxdb.com/drama-box/search/suggest?timestamp=${timestamp}`,
      {
        method: "POST",
        headers: {
          ...this.headers,
          sn: signature,
        },
        body,
      }
    );

    const response = (await res.json()) as {
      status: number;
      message: string;
      data: {
        suggestList?: Array<{
          bookId: string;
          bookName: string;
          cover: string;
          viewCount?: number;
          followCount?: number;
          introduction?: string;
          chapterCount?: number;
          labels?: string[];
          tags?: string[];
          typeTwoIds?: number[];
          typeTwoNames?: string[];
          typeTwoList?: Array<{
            id: number;
            name: string;
            replaceName: string;
          }>;
          language?: string;
          typeTwoName?: string;
          simpleLanguage?: string;
          bookNameEn?: string;
          bookNameLower?: string;
          shelfTime?: string;
          firstShelfTime?: string;
        }>;
      };
    };

    if (response.status !== 0) {
      throw new Error(response.message || "Search failed");
    }

    return {
      searchList: response.data.suggestList?.map((item) => ({
        bookId: item.bookId,
        bookName: item.bookName,
        cover: item.cover,
        viewCount: item.viewCount ?? 0,
        followCount: item.followCount ?? 0,
        introduction: item.introduction ?? "",
        chapterCount: item.chapterCount ?? 0,
        labels: item.labels ?? [],
        tags: item.tags ?? [],
        typeTwoIds: item.typeTwoIds ?? [],
        typeTwoNames: item.typeTwoNames ?? [],
        typeTwoList: item.typeTwoList ?? [],
        language: item.language ?? "",
        typeTwoName: item.typeTwoName ?? "",
        simpleLanguage: item.simpleLanguage ?? "",
        bookNameEn: item.bookNameEn ?? "",
        bookNameLower: item.bookNameLower ?? "",
        shelfTime: item.shelfTime ?? "",
        firstShelfTime: item.firstShelfTime ?? "",
      })),
    };
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
    // Try batchDownload endpoint first (for multiple chapters)
    try {
      const payload = {
        bookId: bookId,
        chapterIdList: chapterIdList,
      };

      const { signature, timestamp } = this.getSignature(payload);
      const body = JSON.stringify(payload);
      const res = await fetch(
        `https://sapi.dramaboxdb.com/drama-box/chapterv2/batchDownload?timestamp=${timestamp}`,
        {
          method: "POST",
          headers: {
            ...this.headers,
            sn: signature,
          },
          body,
        }
      );

      const response = (await res.json()) as {
        status: number;
        message: string;
        data: {
          chapterVoList?: Array<{
            chapterId: string;
            chapterIndex: number;
            isCharge: number;
            chapterName: string;
            cdnList: Array<{
              cdnDomain: string;
              isDefault: number;
              videoPathList: Array<{
                quality: number;
                videoPath: string;
                isDefault: number;
                isEntry: number;
                isVipEquity: number;
              }>;
            }>;
            chapterImg: string;
            chapterType: number;
            needInterstitialAd: number;
            viewingDuration: number;
            chargeChapter: boolean;
          }>;
          bookName?: string;
          bookCover?: string;
          introduction?: string;
        };
      };

      if (response.status === 0 && response.data.chapterVoList) {
        return {
          chapterVoList: response.data.chapterVoList.map((ch) => ({
            chapterId: ch.chapterId,
            chapterIndex: ch.chapterIndex,
            isCharge: ch.isCharge,
            chapterName: ch.chapterName,
            cdnList: ch.cdnList.map((cdn) => ({
              cdnDomain: cdn.cdnDomain,
              isDefault: cdn.isDefault,
              videoPathList: cdn.videoPathList.map((vp) => ({
                quality: vp.quality,
                videoPath: vp.videoPath,
                isDefault: vp.isDefault,
                isEntry: vp.isEntry,
                isVipEquity: vp.isVipEquity,
              })),
            })),
            chapterImg: ch.chapterImg,
            chapterType: ch.chapterType,
            needInterstitialAd: ch.needInterstitialAd,
            viewingDuration: ch.viewingDuration,
            chargeChapter: ch.chargeChapter,
          })),
          bookName: response.data.bookName ?? "",
          bookCover: response.data.bookCover ?? "",
          introduction: response.data.introduction ?? "",
        };
      }
    } catch (error) {
      // Fallback to batch/load if batchDownload fails
    }

    // Fallback: Use batch/load for each chapter (slower but more reliable)
    const allChapters: UnlockChapterItem[] = [];
    let bookName = "";
    let bookCover = "";
    let introduction = "";

    // Get book detail first to get chapter indices
    const bookDetail = await this.getBookDetail(bookId);
    bookName = bookDetail.book.bookName;
    bookCover = bookDetail.book.cover;
    introduction = bookDetail.book.introduction;

    // Load each chapter using batch/load endpoint
    for (let i = 0; i < chapterIdList.length; i++) {
      const chapterId = chapterIdList[i];
      if (!chapterId) continue;

      // Find chapter index from bookDetail
      const chapterFromDetail = bookDetail.chapterList.find(
        (ch) => ch.id === chapterId
      );
      if (!chapterFromDetail) continue;

      const chapterIndex = chapterFromDetail.index + 1; // API uses 1-based index

      try {
        const payload = {
          boundaryIndex: 0,
          comingPlaySectionId: -1,
          index: chapterIndex,
          currencyPlaySource: "discover_new_rec_new",
          needEndRecommend: 0,
          currencyPlaySourceName: "",
          preLoad: false,
          rid: "",
          pullCid: "",
          loadDirection: 0,
          startUpKey: "",
          bookId: bookId,
        };

        const { signature, timestamp } = this.getSignature(payload);
        const body = JSON.stringify(payload);
        const res = await fetch(
          `https://sapi.dramaboxdb.com/drama-box/chapterv2/batch/load?timestamp=${timestamp}`,
          {
            method: "POST",
            headers: {
              ...this.headers,
              sn: signature,
            },
            body,
          }
        );

        const response = (await res.json()) as {
          status: number;
          message: string;
          data: {
            chapterList?: Array<{
              chapterId: string;
              chapterIndex: number;
              isCharge: number;
              chapterName: string;
              cdnList: Array<{
                cdnDomain: string;
                isDefault: number;
                videoPathList: Array<{
                  quality: number;
                  videoPath: string;
                  isDefault: number;
                  isEntry: number;
                  isVipEquity: number;
                }>;
              }>;
              chapterImg: string;
              chapterType: number;
              needInterstitialAd: number;
              viewingDuration: number;
              chargeChapter: boolean;
            }>;
            bookName?: string;
            bookCover?: string;
            introduction?: string;
          };
        };

        if (
          response.status === 0 &&
          response.data.chapterList &&
          response.data.chapterList.length > 0
        ) {
          const chapter = response.data.chapterList[0];
          if (chapter && chapter.chapterId === chapterId) {
            allChapters.push({
              chapterId: chapter.chapterId,
              chapterIndex: chapter.chapterIndex,
              isCharge: chapter.isCharge,
              chapterName: chapter.chapterName,
              cdnList: chapter.cdnList.map((cdn) => ({
                cdnDomain: cdn.cdnDomain,
                isDefault: cdn.isDefault,
                videoPathList: cdn.videoPathList.map((vp) => ({
                  quality: vp.quality,
                  videoPath: vp.videoPath,
                  isDefault: vp.isDefault,
                  isEntry: vp.isEntry,
                  isVipEquity: vp.isVipEquity,
                })),
              })),
              chapterImg: chapter.chapterImg,
              chapterType: chapter.chapterType,
              needInterstitialAd: chapter.needInterstitialAd,
              viewingDuration: chapter.viewingDuration,
              chargeChapter: chapter.chargeChapter,
            });
          }
        }
      } catch (error) {
        // Continue to next chapter if this one fails
        continue;
      }
    }

    if (allChapters.length === 0) {
      const error = new Error("No chapters could be unlocked");
      error.name = "UnlockError";
      throw error;
    }

    return {
      chapterVoList: allChapters,
      bookName,
      bookCover,
      introduction,
    };
  }

  async getChapterVideoUrl(
    bookId: string,
    chapterId: string,
    quality?: number
  ): Promise<{ url: string; quality: number } | null> {
    const unlocked = await this.batchUnlockEpisode(bookId, [chapterId]);
    const chapter = unlocked.chapterVoList.find(
      (ch) => ch.chapterId === chapterId
    );

    if (!chapter || chapter.cdnList.length === 0) {
      return null;
    }

    let mp4Url: string | null = null;
    let qualitySelected: number | null = null;

    if (quality) {
      for (const cdn of chapter.cdnList) {
        const videoPathList = cdn.videoPathList;
        const correctQuality = videoPathList.find(
          (path) => path.quality === quality
        );
        if (correctQuality) {
          const videoPath = correctQuality.videoPath;
          const base = (cdn.cdnDomain ?? "").replace(/\/+$/, "");
          const pathPart = String(videoPath ?? "").replace(/^\/+/, "");
          mp4Url =
            videoPath.startsWith("http://") || videoPath.startsWith("https://")
              ? videoPath
              : base
              ? `${base}/${pathPart}`
              : videoPath;
          qualitySelected = correctQuality.quality;
          break;
        }
      }
    } else {
      for (const cdn of chapter.cdnList) {
        const sorted = [...cdn.videoPathList].sort(
          (a, b) => b.quality - a.quality
        );
        if (sorted.length === 0) continue;
        const vp = sorted[0];
        if (!vp) continue;
        const videoPath = vp.videoPath;
        const base = (cdn.cdnDomain ?? "").replace(/\/+$/, "");
        const pathPart = String(videoPath ?? "").replace(/^\/+/, "");
        mp4Url =
          videoPath.startsWith("http://") || videoPath.startsWith("https://")
            ? videoPath
            : base
            ? `${base}/${pathPart}`
            : videoPath;
        qualitySelected = vp.quality;
        break;
      }
    }

    if (!mp4Url) {
      return null;
    }

    return { url: mp4Url, quality: qualitySelected || 0 };
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
    const detail = await this.getBookDetail(bookId);
    const chapters = detail.chapterList.map((chapter) => chapter.id);
    const unlocked = await this.batchUnlockEpisode(bookId, chapters);

    const sortedChapters = unlocked.chapterVoList.sort(
      (a, b) => a.chapterIndex - b.chapterIndex
    );

    const chapterList: Array<{
      chapterIndex: number;
      chapterId: string;
      mp4Url: string;
      qualitySelected: number;
    }> = [];
    for (const chapter of sortedChapters) {
      if (chapter.cdnList.length === 0) {
        continue;
      }
      let mp4Url: string | null = null;
      let qualitySelected: number | null = null;
      if (quality) {
        for (const cdn of chapter.cdnList) {
          const videoPathList = cdn.videoPathList;
          const correctQuality = videoPathList.find(
            (path) => path.quality === quality
          );
          if (correctQuality) {
            const videoPath = correctQuality.videoPath;
            const base = (cdn.cdnDomain ?? "").replace(/\/+$/, "");
            const pathPart = String(videoPath ?? "").replace(/^\/+/, "");
            mp4Url =
              videoPath.startsWith("http://") ||
              videoPath.startsWith("https://")
                ? videoPath
                : base
                ? `${base}/${pathPart}`
                : videoPath;
            qualitySelected = correctQuality.quality;
            break;
          }
        }
      } else {
        for (const cdn of chapter.cdnList) {
          const sorted = [...cdn.videoPathList].sort(
            (a, b) => b.quality - a.quality
          );
          if (sorted.length === 0) continue;
          const vp = sorted[0];
          if (!vp) continue;
          const videoPath = vp.videoPath;
          const base = (cdn.cdnDomain ?? "").replace(/\/+$/, "");
          const pathPart = String(videoPath ?? "").replace(/^\/+/, "");
          mp4Url =
            videoPath.startsWith("http://") ||
            videoPath.startsWith("https://")
              ? videoPath
              : base
              ? `${base}/${pathPart}`
              : videoPath;
          qualitySelected = vp.quality;
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
  }
}

export const dramaboxServerApi = new DramaboxServerAPI();

