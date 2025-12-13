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
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
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

  const scrollToVideoPlayer = () => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      const videoPlayerElement = document.getElementById('videoPlayer');
      if (videoPlayerElement) {
        videoPlayerElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  useEffect(() => {
    if (!id) return;

    const loadSeriesDetail = async () => {
      setIsLoading(true);
      try {
        // Load book detail first (fast - shows basic info)
        const detail = await dramaboxApi.getBookDetail(id);
        setBookDetail(detail);

        // Mark initial loading as complete - user can see book info now
        setIsLoading(false);

        // Load all episodes (this may take time, but we show loading indicator)
        setIsLoadingEpisodes(true);
        try {
          const streamData = await dramaboxApi.getAllEpisodes(id);
          const chapters = streamData.chapters || [];
          
          if (chapters.length > 0) {
            const unlockedChaptersList: UnlockChapterItem[] = chapters.map((ch) => ({
              chapterId: ch.chapterId,
              chapterIndex: ch.chapterIndex || 0,
              isCharge: 0,
              chapterName: ch.chapterName,
              cdnList: ch.videoUrls ? [{
                cdnDomain: '',
                isDefault: 1,
                videoPathList: ch.videoUrls.map((v) => ({
                  quality: v.quality,
                  videoPath: v.url,
                  isDefault: v.quality === ch.videoUrls?.[0]?.quality ? 1 : 0,
                  isEntry: 0,
                  isVipEquity: 0,
                })),
              }] : ch.videoUrl ? [{
                cdnDomain: '',
                isDefault: 1,
                videoPathList: [{
                  quality: 720,
                  videoPath: ch.videoUrl,
                  isDefault: 1,
                  isEntry: 0,
                  isVipEquity: 0,
                }],
              }] : [],
              chapterImg: ch.cover || '',
              chapterType: 0,
              needInterstitialAd: 0,
              viewingDuration: ch.duration || 0,
              chargeChapter: false,
            }));

            const sorted = unlockedChaptersList
              .map((chapter) => ({
                ...chapter,
                chapterIndex: chapter.chapterIndex || Number(chapter.chapterId?.match(/\d+/)?.[0]) || 0,
              }))
              .sort((a, b) => a.chapterIndex - b.chapterIndex);
            setUnlockedChapters(deduplicateChapters(sorted));
          } else {
            // Fallback: Use chapterList from detail if getAllEpisodes returns empty
            if (detail.chapterList.length > 0) {
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
          }
        } catch (error) {
          console.warn('Failed to load episodes from API, using fallback:', error);
          // Fallback: Use chapterList from detail if getAllEpisodes fails
          if (detail.chapterList.length > 0) {
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
        } finally {
          setIsLoadingEpisodes(false);
        }
      } catch (error) {
        console.error('Failed to load series detail:', error);
        setIsLoading(false);
        setIsLoadingEpisodes(false);
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
    
    // Scroll to video player
    scrollToVideoPlayer();

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

      // Last resort: Try stream API
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
      <div className="flex justify-center items-center min-h-screen text-white bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full border-b-2 border-purple-600 animate-spin"></div>
          <p>Memuat detail series...</p>
        </div>
      </div>
    );
  }

  if (!bookDetail) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white bg-gray-900">
        <div className="text-center">
          <p className="mb-4 text-red-400">Series tidak ditemukan</p>
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
    <div className="min-h-screen text-white bg-gray-900">
      <div className="container px-4 py-6 mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex gap-2 items-center mb-6 text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <img
              src={bookDetail.book.cover || bookDetail.book.coverWap || '/placeholder.jpg'}
              alt={bookDetail.book.bookName}
              className="w-full rounded-lg shadow-lg"
              onError={(e) => {
                // Fallback to coverWap if cover fails
                const target = e.target as HTMLImageElement;
                if (bookDetail.book.coverWap && target.src !== bookDetail.book.coverWap) {
                  target.src = bookDetail.book.coverWap;
                } else {
                  target.src = '/placeholder.jpg';
                }
              }}
            />
          </div>
          <div className="lg:col-span-2">
            <h1 className="mb-4 text-2xl font-bold md:text-3xl">
              {bookDetail.book.bookName}
            </h1>
            <p className="mb-4 text-gray-400">{bookDetail.book.introduction}</p>
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
                    className="px-3 py-1 text-sm text-purple-300 rounded-full bg-purple-600/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedChapter && (
          <div className="mb-8" id='videoPlayer'>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                {selectedChapter.chapterName} - Episode {selectedChapter.chapterIndex}
              </h2>
            </div>
            {isLoadingVideo ? (
              <div className="flex justify-center items-center w-full bg-black rounded-lg aspect-video">
                <div className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full border-b-2 border-purple-600 animate-spin"></div>
                  <p>Memuat video...</p>
                </div>
              </div>
            ) : videoError ? (
              <div className="flex justify-center items-center w-full bg-black rounded-lg aspect-video">
                <div className="p-6 text-center">
                  <p className="mb-2 text-red-400">{videoError}</p>
                  <p className="text-sm text-gray-400">Silakan coba episode lain atau refresh halaman.</p>
                </div>
              </div>
            ) : videoUrl ? (
              <VideoPlayer
                src={videoUrl}
                title={selectedChapter.chapterName}
                onDownload={handleDownload}
                thumbnail={selectedChapter.chapterImg}
                availableQualities={availableQualities}
                selectedQuality={selectedQuality}
                onQualityChange={handleQualityChange}
              />
            ) : null}
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Daftar Episode</h2>
            {isLoadingEpisodes && (
              <div className="flex gap-2 items-center text-sm text-gray-400">
                <div className="w-4 h-4 rounded-full border-b-2 border-purple-600 animate-spin"></div>
                <span>Memuat link video...</span>
              </div>
            )}
          </div>
          {unlockedChapters.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-gray-400">Episode belum tersedia</p>
              {bookDetail && bookDetail.chapterList.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
                        
                        // Scroll to video player
                        scrollToVideoPlayer();
                        
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
                      className="p-3 text-left bg-gray-800 rounded-lg transition-all hover:bg-gray-700"
                    >
                      <div className="flex gap-2 items-center mb-1">
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-semibold">
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
                  <div className="flex gap-2 items-center mb-1">
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-semibold">
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

