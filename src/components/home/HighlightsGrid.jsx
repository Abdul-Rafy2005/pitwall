import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../config/api';

const HighlightsGrid = () => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [thumbnailFallbackIndex, setThumbnailFallbackIndex] = useState({});
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Thumbnail quality levels in order of preference
  const THUMBNAIL_QUALITIES = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'];

  const categoryColors = {
    RACE: '#E8002D',
    QUALIFYING: '#BF5FFF',
    PRACTICE: '#3671C6',
    SPRINT: '#FF6B00',
    INCIDENT: '#FF4444',
    ONBOARD: '#27F4D2',
    HIGHLIGHTS: '#E8002D'
  };

  // Helper function to get thumbnail URL based on video ID and quality level
  const getThumbnailUrl = (videoId, qualityIndex = 0) => {
    if (qualityIndex >= THUMBNAIL_QUALITIES.length) {
      return null; // All fallbacks exhausted
    }
    const quality = THUMBNAIL_QUALITIES[qualityIndex];
    return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
  };

  const decodeHTML = (str) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  };

  const getCategory = (title) => {
    const t = title.toLowerCase();
    if (t.includes('race') && t.includes('highlight')) return 'RACE';
    if (t.includes('qualifying') || t.includes('quali')) return 'QUALIFYING';
    if (t.includes('practice') || t.includes('fp1') || t.includes('fp2') || t.includes('fp3')) return 'PRACTICE';
    if (t.includes('sprint')) return 'SPRINT';
    if (t.includes('crash') || t.includes('incident') || t.includes('accident')) return 'INCIDENT';
    if (t.includes('onboard') || t.includes('lap')) return 'ONBOARD';
    return 'HIGHLIGHTS';
  };

  const getRelevanceScore = (title) => {
    const t = (title || '').toLowerCase();
    let score = 0;
    if (t.includes('highlight')) score += 6;
    if (t.includes('race')) score += 5;
    if (t.includes('grand prix') || t.includes('gp')) score += 4;
    if (t.includes('crash') || t.includes('incident') || t.includes('accident')) score += 5;
    if (t.includes('controversy') || t.includes('penalty') || t.includes('stewards')) score += 4;
    if (t.includes('qualifying') || t.includes('quali')) score += 3;
    if (t.includes('sprint')) score += 2;
    if (t.includes('onboard') || t.includes('overtake')) score += 2;
    return score;
  };

  const isRelevant = (title) => {
    const t = title.toLowerCase();
    return t.includes('qualifying') || t.includes('race') ||
      t.includes('practice') || t.includes('sprint') ||
      t.includes('crash') || t.includes('highlight') ||
      t.includes('grand prix') || t.includes('onboard') ||
      t.includes('lap') || t.includes('overtake') ||
      t.includes('incident') || t.includes('controversy') ||
      t.includes('penalty') || t.includes('stewards');
  };

  const handleThumbnailError = (videoId) => {
    const currentIndex = thumbnailFallbackIndex[videoId] || 0;
    const nextIndex = currentIndex + 1;
    
    console.log(`Thumbnail failed for ${videoId} at quality ${THUMBNAIL_QUALITIES[currentIndex]}, trying fallback ${nextIndex}`);
    
    if (nextIndex < THUMBNAIL_QUALITIES.length) {
      // Try next quality level
      setThumbnailFallbackIndex(prev => ({
        ...prev,
        [videoId]: nextIndex
      }));
    } else {
      // All fallbacks exhausted
      console.error(`All thumbnail fallbacks exhausted for video ${videoId}`);
      setImageLoadingStates(prev => ({ ...prev, [videoId]: false }));
    }
  };

  useEffect(() => {
    fetch(apiUrl('/api/highlights'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors'
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Highlights data:', data);
        const currentYear = new Date().getFullYear();
        if (data.items && data.items.length > 0) {
          const officialF1Items = data.items.filter((item) => {
            const channelId = item?.snippet?.channelId;
            const channelTitle = (item?.snippet?.channelTitle || '').toLowerCase();
            const publishedYear = new Date(item?.snippet?.publishedAt).getFullYear();
            return (channelId === 'UCB_qr75-ydFVKSF9Dmo6izg' || channelTitle === 'formula 1')
              && publishedYear === currentYear;
          });

          const mapped = officialF1Items
            .map(item => {
              const videoId = item.id.videoId;
              return {
                id: videoId,
                videoId: videoId, // Store separately for thumbnail construction
                title: decodeHTML(item.snippet.title),
                publishedAt: new Date(item.snippet.publishedAt)
                  .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                thumbnail: getThumbnailUrl(videoId, 0),
                publishedAtRaw: item.snippet.publishedAt,
                relevanceScore: getRelevanceScore(item.snippet.title),
                category: getCategory(item.snippet.title)
              };
            });

          const relevantSorted = mapped
            .filter(video => isRelevant(video.title))
            .sort((a, b) => {
              if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
              }
              return new Date(b.publishedAtRaw) - new Date(a.publishedAtRaw);
            });

          const remaining = mapped
            .filter(video => !relevantSorted.some((v) => v.id === video.id))
            .sort((a, b) => new Date(b.publishedAtRaw) - new Date(a.publishedAtRaw));

          // Guarantee at least 6 cards when enough channel videos exist.
          const finalVideos = [...relevantSorted, ...remaining].slice(0, 6);

          console.log('Processed videos:', finalVideos.length);
          setHighlights(finalVideos);
          
          // Initialize loading states and fallback indices
          const initialLoadingState = {};
          const initialFallbackIndex = {};
          finalVideos.forEach(video => {
            initialLoadingState[video.videoId] = true;
            initialFallbackIndex[video.videoId] = 0;
          });
          setImageLoadingStates(initialLoadingState);
          setThumbnailFallbackIndex(initialFallbackIndex);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Highlights error:', err);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (video) => setSelectedVideo(video);
  const handleCloseModal = () => setSelectedVideo(null);

  return (
    <div className="bg-[#0a0a0a] py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-[#E8002D]" />
            <h2 className="font-titillium font-bold text-white text-3xl uppercase">Latest Highlights</h2>
          </div>
          <Link
            to="/schedule"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md border border-[#E8002D]/70 bg-[#111111] px-5 py-2 font-titillium text-xs font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E8002D] hover:shadow-[0_14px_28px_rgba(232,0,45,0.35)]"
          >
            <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(232,0,45,0.7)_55%,rgba(232,0,45,0.95)_100%)] opacity-80" />
            <span className="relative">View All</span>
            <span className="relative transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 rounded-lg shimmer-loading" />
            <div className="flex flex-col gap-6">
              <div className="h-48 rounded-lg shimmer-loading" />
              <div className="h-48 rounded-lg shimmer-loading" />
            </div>
          </div>
        ) : highlights.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              padding: '0 5%'
            }}
          >
            {highlights.slice(0, 6).map((video) => {
              const currentFallbackIndex = thumbnailFallbackIndex[video.videoId] || 0;
              const thumbnailUrl = getThumbnailUrl(video.videoId, currentFallbackIndex);
              const allFallbacksExhausted = currentFallbackIndex >= THUMBNAIL_QUALITIES.length;

              return (
                <div
                  key={video.id}
                  onClick={() => handleCardClick(video)}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    aspectRatio: '16/9',
                    background: '#1a1a1a'
                  }}
                >
                  {/* Loading shimmer while image is loading */}
                  {imageLoadingStates[video.videoId] && !allFallbacksExhausted && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, #222 25%, #333 50%, #222 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                        zIndex: 1
                      }}
                    />
                  )}

                  {/* Thumbnail */}
                  {!allFallbacksExhausted && thumbnailUrl ? (
                    <img
                      key={`${video.videoId}-${currentFallbackIndex}`}
                      src={thumbnailUrl}
                      alt={video.title}
                      loading="lazy"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onLoad={() => {
                        console.log(`✓ Thumbnail loaded for ${video.videoId} at quality ${THUMBNAIL_QUALITIES[currentFallbackIndex]}`);
                        setImageLoadingStates(prev => ({ ...prev, [video.videoId]: false }));
                      }}
                      onError={(e) => {
                        console.warn(`✗ Thumbnail failed for ${video.videoId} at quality ${THUMBNAIL_QUALITIES[currentFallbackIndex]}`);
                        handleThumbnailError(video.videoId);
                      }}
                      onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: 'rgba(232,0,45,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid rgba(232,0,45,0.4)'
                        }}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#E8002D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                      </div>
                      <span
                        style={{
                          color: 'rgba(232,0,45,0.7)',
                          fontSize: '11px',
                          fontFamily: 'Titillium Web',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase'
                        }}
                      >
                        Preview Unavailable
                      </span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)',
                      zIndex: 2
                    }}
                  />

                  {/* Category badge */}
                  <div
                    style={{
                      position: 'absolute', top: '10px', left: '10px',
                      background: categoryColors[video.category] || '#E8002D',
                      color: 'white', padding: '3px 10px',
                      borderRadius: '4px', fontSize: '10px',
                      fontWeight: 700, letterSpacing: '0.1em',
                      zIndex: 3
                    }}
                  >
                    {video.category}
                  </div>

                  {/* Date */}
                  <div
                    style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'rgba(255,255,255,0.7)',
                      padding: '3px 8px', borderRadius: '4px',
                      fontSize: '11px',
                      zIndex: 3
                    }}
                  >
                    {video.publishedAt}
                  </div>

                  {/* Play button - small and clean */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '44px', height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(232,0,45,0.9)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      boxShadow: '0 0 20px rgba(232,0,45,0.5)',
                      zIndex: 3
                    }}
                  >
                    ▶
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      position: 'absolute', bottom: 0,
                      left: 0, right: 0, padding: '12px',
                      zIndex: 3
                    }}
                  >
                    <p
                      style={{
                        color: 'white', fontSize: '13px',
                        fontWeight: 700, lineHeight: 1.3,
                        fontFamily: 'Titillium Web',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {video.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-[#111] p-6 text-center text-white/70 font-titillium">
            No highlights available right now.
          </div>
        )}
      </div>

      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleCloseModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '85vw', maxWidth: '900px',
              borderRadius: '16px', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 60px rgba(232,0,45,0.25)',
              position: 'relative'
            }}
          >
            {/* Thumbnail background */}
            <div
              style={{
                position: 'relative', height: '500px',
                backgroundImage: `url(${selectedVideo.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Dark overlay */}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)'
                }}
              />

              {/* Close button */}
              <button
                onClick={handleCloseModal}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'linear-gradient(145deg, rgba(232,0,45,1), rgba(180,0,34,0.95))', border: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: '50%', width: '40px', height: '40px',
                  color: 'white', fontSize: '20px', cursor: 'pointer',
                  zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 24px rgba(232,0,45,0.45)'
                }}
              >✕</button>

              {/* Category badge */}
              <div
                style={{
                  position: 'absolute', top: '16px', left: '16px',
                  background: categoryColors[selectedVideo.category] || categoryColors.HIGHLIGHTS,
                  color: 'white',
                  padding: '4px 12px', borderRadius: '4px',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em'
                }}
              >
                {selectedVideo.category}
              </div>

              {/* Bottom content */}
              <div
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '32px'
                }}
              >
                <p
                  style={{
                    color: 'white', fontSize: '22px',
                    fontWeight: 800, fontFamily: 'Titillium Web',
                    marginBottom: '24px', lineHeight: 1.3
                  }}
                >
                  {selectedVideo.title}
                </p>

                <a
                  href={selectedVideo.videoUrl || `https://www.youtube.com/watch?v=${selectedVideo.id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    background: 'linear-gradient(120deg, #2b0910 0%, #E8002D 45%, #b50021 100%)', color: 'white',
                    padding: '14px 30px', borderRadius: '10px',
                    fontFamily: 'Titillium Web', fontWeight: 700,
                    fontSize: '15px', textDecoration: 'none',
                    letterSpacing: '0.07em',
                    border: '1px solid rgba(255,255,255,0.24)',
                    boxShadow: '0 16px 32px rgba(232,0,45,0.45)'
                  }}
                >
                  ▶ WATCH ON YOUTUBE
                </a>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.4)', fontSize: '12px',
                    marginTop: '12px'
                  }}
                >
                  F1 content opens on YouTube
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HighlightsGrid;
