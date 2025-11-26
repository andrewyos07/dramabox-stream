import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { dramaboxApi } from '../services/dramaboxApi';
import type { BookDetail, UnlockChapterItem } from '../services/dramaboxApi';

export default function SeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
  const [unlockedChapters, setUnlockedChapters] = useState<UnlockChapterItem[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<UnlockChapterItem | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const [availableQualities, setAvailableQualities] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const deduplicateChapters = (chapters: UnlockChapterItem[]) => {
    const seen = new Set<number>();
    return chapters.filter((chapter) => {
      const index = chapter.chapterIndex ?? 0;
      if (seen.has(index)) {
        return false;
      }
      seen.add(index);
      return true;
    });
  };

  useEffect(() => {
    if (!id) return;

    const loadSeriesDetail = async () => {
      setIsLoading(true);
      try {
        const detail = await dramaboxApi.getBookDetail(id);
        setBookDetail(detail);

        // Try to unlock episodes, but if it fails, we'll use the chapter list from detail
        try {
          const chapterIds = detail.chapterList.map((ch) => ch.id);
          const unlocked = await dramaboxApi.batchUnlockEpisode(id, chapterIds);
          const sorted = unlocked.chapterVoList
            .map((chapter) => ({
              ...chapter,
              chapterIndex: chapter.chapterIndex || Number(chapter.chapterId?.match(/\d+/)?.[0]) || 0,
            }))
            .sort((a, b) => a.chapterIndex - b.chapterIndex);
          setUnlockedChapters(deduplicateChapters(sorted));
        } catch {
          // Silently fallback to chapter list from detail
          // This is expected when API authentication fails
          const fallbackChapters = detail.chapterList.map((ch, index) => ({
            chapterId: ch.id,
            chapterIndex: ch.index || index + 1,
            isCharge: 0,
            chapterName: ch.name || `Episode ${ch.index || index + 1}`,
            cdnList: [],
            chapterImg: ch.cover || '',
            chapterType: 0,
            needInterstitialAd: 0,
            viewingDuration: ch.duration || 0,
            chargeChapter: false,
          }));
          setUnlockedChapters(deduplicateChapters(fallbackChapters));
        }
      } catch {
        // Silently handle error
      } finally {
        setIsLoading(false);
      }
    };

    loadSeriesDetail();
  }, [id]);

  const handleChapterSelect = async (chapter: UnlockChapterItem) => {
    if (!id || !bookDetail) return;
    
    setSelectedChapter(chapter);
    setIsLoadingVideo(true);
    setVideoError(null);
    setVideoUrl(null);

    try {
      // First, check if chapter has cdnList from unlocked data
      if (chapter.cdnList && chapter.cdnList.length > 0) {
        const qualities = chapter.cdnList
          .flatMap((cdn) => cdn.videoPathList.map((v) => v.quality))
          .filter((q, index, self) => self.indexOf(q) === index)
          .sort((a, b) => b - a);

        setAvailableQualities(qualities);
        setSelectedQuality(qualities[0] || null);

        const selectedCdn = chapter.cdnList[0];
        if (selectedCdn && selectedCdn.videoPathList.length > 0) {
          const videoPath = selectedCdn.videoPathList.find(
            (v) => v.quality === qualities[0]
          ) || selectedCdn.videoPathList[0];
          setVideoUrl(videoPath.videoPath);
          return;
        }
      }

      // Fallback: Try to get video URL from bookDetail.chapterList
      const chapterFromDetail = bookDetail.chapterList.find(
        (ch) => ch.id === chapter.chapterId
      );

      if (chapterFromDetail) {
        // Check if chapter has direct mp4 or m3u8 URL
        if (chapterFromDetail.mp4) {
          setVideoUrl(chapterFromDetail.mp4);
          setAvailableQualities([720]); // Default quality
          setSelectedQuality(720);
          return;
        } else if (chapterFromDetail.m3u8Url) {
          setVideoUrl(chapterFromDetail.m3u8Url);
          setAvailableQualities([720]);
          setSelectedQuality(720);
          return;
        }
      }

      // Last resort: Try API (may fail due to auth)
      try {
        const videoInfo = await dramaboxApi.getChapterVideoUrl(id, chapter.chapterId);
        if (videoInfo && videoInfo.url) {
          setVideoUrl(videoInfo.url);
          setAvailableQualities([videoInfo.quality]);
          setSelectedQuality(videoInfo.quality);
        } else {
          setVideoError('Video tidak tersedia untuk episode ini. Silakan coba episode lain.');
        }
      } catch {
        setVideoError('Video tidak tersedia untuk episode ini. Silakan coba episode lain.');
      }
    } catch {
      setVideoError('Video tidak tersedia saat ini. Silakan coba lagi nanti.');
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleQualityChange = (quality: number) => {
    if (!selectedChapter) return;

    setSelectedQuality(quality);
    const selectedCdn = selectedChapter.cdnList[0];
    if (selectedCdn) {
      const videoPath = selectedCdn.videoPathList.find((v) => v.quality === quality);
      if (videoPath) {
        setVideoUrl(videoPath.videoPath);
      }
    }
  };

  const handleDownload = async () => {
    if (!videoUrl || !selectedChapter) return;

    try {
      // Try direct download first
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${selectedChapter.chapterName || `Episode-${selectedChapter.chapterIndex}`}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Fallback: open in new tab
      window.open(videoUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Memuat detail series...</p>
        </div>
      </div>
    );
  }

  if (!bookDetail) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Series tidak ditemukan</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <img
              src={bookDetail.book.cover}
              alt={bookDetail.book.bookName}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="lg:col-span-2">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {bookDetail.book.bookName}
            </h1>
            <p className="text-gray-400 mb-4">{bookDetail.book.introduction}</p>
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <span className="text-gray-500">Episode: </span>
                <span className="text-white">{bookDetail.book.chapterCount ?? 0}</span>
              </div>
              {bookDetail.book.viewCount != null && (
                <div>
                  <span className="text-gray-500">Views: </span>
                  <span className="text-white">
                    {bookDetail.book.viewCount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            {bookDetail.book.tags && bookDetail.book.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {bookDetail.book.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedChapter && (
          <div className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <h2 className="text-xl font-semibold">
                {selectedChapter.chapterName} - Episode {selectedChapter.chapterIndex}
              </h2>
              {availableQualities.length > 1 && videoUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Quality:</span>
                  <select
                    value={selectedQuality || ''}
                    onChange={(e) => handleQualityChange(Number(e.target.value))}
                    className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {availableQualities.map((q) => (
                      <option key={q} value={q}>
                        {q}p
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {isLoadingVideo ? (
              <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p>Memuat video...</p>
                </div>
              </div>
            ) : videoError ? (
              <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-center p-6">
                  <p className="text-red-400 mb-2">{videoError}</p>
                  <p className="text-gray-400 text-sm">Silakan coba episode lain atau refresh halaman.</p>
                </div>
              </div>
            ) : videoUrl ? (
              <VideoPlayer
                src={videoUrl}
                title={selectedChapter.chapterName}
                onDownload={handleDownload}
              />
            ) : null}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">Daftar Episode</h2>
          {unlockedChapters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">Episode belum tersedia</p>
              {bookDetail && bookDetail.chapterList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {bookDetail.chapterList.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      onClick={async () => {
                        if (!id || !bookDetail) return;
                        const chapterData = {
                          chapterId: chapter.id,
                          chapterIndex: chapter.index || index + 1,
                          isCharge: 0,
                          chapterName: chapter.name || `Episode ${chapter.index || index + 1}`,
                          cdnList: [],
                          chapterImg: chapter.cover || '',
                          chapterType: 0,
                          needInterstitialAd: 0,
                          viewingDuration: chapter.duration || 0,
                          chargeChapter: false,
                        };
                        setSelectedChapter(chapterData);
                        setIsLoadingVideo(true);
                        setVideoError(null);
                        setVideoUrl(null);
                        
                        try {
                          // First, try to use direct mp4 or m3u8 URL from chapter
                          if (chapter.mp4) {
                            setVideoUrl(chapter.mp4);
                            setAvailableQualities([720]);
                            setSelectedQuality(720);
                            return;
                          } else if (chapter.m3u8Url) {
                            setVideoUrl(chapter.m3u8Url);
                            setAvailableQualities([720]);
                            setSelectedQuality(720);
                            return;
                          }

                          // Fallback: Try API (may fail due to auth)
                          const videoInfo = await dramaboxApi.getChapterVideoUrl(id, chapter.id);
                          if (videoInfo && videoInfo.url) {
                            setVideoUrl(videoInfo.url);
                            setAvailableQualities([videoInfo.quality]);
                            setSelectedQuality(videoInfo.quality);
                          } else {
                            setVideoError('Video tidak tersedia untuk episode ini. Silakan coba episode lain.');
                          }
                        } catch {
                          setVideoError('Video tidak tersedia saat ini. Silakan coba lagi nanti.');
                        } finally {
                          setIsLoadingVideo(false);
                        }
                      }}
                      className="p-3 rounded-lg text-left transition-all bg-gray-800 hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Play className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          Episode {chapter.index || index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {chapter.name || `Episode ${chapter.index || index + 1}`}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {unlockedChapters.map((chapter) => (
                <button
                  key={chapter.chapterId}
                  onClick={() => handleChapterSelect(chapter)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    selectedChapter?.chapterId === chapter.chapterId
                      ? 'bg-purple-600 ring-2 ring-purple-400'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Play className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      Episode {chapter.chapterIndex}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {chapter.chapterName}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

