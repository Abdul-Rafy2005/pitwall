import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { saveArticleForTab } from '../../services/newsTabStore';
import { apiUrl } from '../../config/api';

const NEWS_CACHE_TTL_MS = 15 * 60 * 1000;
let cachedNewsArticles = null;
let cachedNewsFetchedAt = 0;

const CATEGORY_STYLES = {
  RACE: { label: 'RACE', color: '#E8002D' },
  QUALIFYING: { label: 'QUALIFYING', color: '#8C5BFF' },
  INCIDENT: { label: 'INCIDENT', color: '#FF7A00' },
  CHAMPIONSHIP: { label: 'CHAMPIONSHIP', color: '#D4AF37' },
  DEFAULT: { label: 'F1 NEWS', color: '#1CB8A8' }
};

const resolveCategory = (title = '') => {
  const normalized = title.toLowerCase();
  if (/\brace\b|grand prix|\bgp\b/.test(normalized)) return CATEGORY_STYLES.RACE;
  if (normalized.includes('qualifying')) return CATEGORY_STYLES.QUALIFYING;
  if (normalized.includes('crash') || normalized.includes('accident')) return CATEGORY_STYLES.INCIDENT;
  if (normalized.includes('championship') || normalized.includes('standings')) return CATEGORY_STYLES.CHAMPIONSHIP;
  return CATEGORY_STYLES.DEFAULT;
};

const formatRelativeTime = (publishedAt) => {
  if (!publishedAt) return 'recently';
  const published = new Date(publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - published.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
};

const EditorsPicks = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorHint, setErrorHint] = useState('');

  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      setErrorHint('');

      const cacheFresh = cachedNewsArticles && (Date.now() - cachedNewsFetchedAt) < NEWS_CACHE_TTL_MS;
      if (!forceRefresh && cacheFresh) {
        setArticles(cachedNewsArticles);
        setLoading(false);
        return;
      }

      const endpoint = apiUrl('/api/news');
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      const normalizedArticles = Array.isArray(data)
        ? data
          .filter((item) => item?.title && item?.url)
          .slice(0, 8)
          .map((item, index) => ({
            id: `${item.url}-${index}`,
            title: item.title,
            description: item.description || '',
            content: item.content || '',
            url: item.url,
            image: item.image || '',
            publishedAt: item.publishedAt,
            sourceName: item?.source?.name || 'Unknown source',
            category: resolveCategory(item.title)
          }))
        : [];

      if (normalizedArticles.length === 0) {
        throw new Error('No articles returned');
      }

      cachedNewsArticles = normalizedArticles;
      cachedNewsFetchedAt = Date.now();
      setArticles(normalizedArticles);
    } catch (fetchError) {
      console.error('Failed to load news articles:', fetchError);
      setError('News unavailable — check back soon');
      const message = String(fetchError?.message || '').toLowerCase();
      if (message.includes('failed to fetch')) {
        setErrorHint('Network error while contacting the news service. Check your connection.');
      } else {
        setErrorHint('Please retry in a moment. The news service may be temporarily unavailable.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const featuredArticle = articles[0] || null;
  const stackedArticles = useMemo(() => articles.slice(1, 4), [articles]);
  const gridArticles = useMemo(() => articles.slice(4, 8), [articles]);

  const openArticle = (article) => {
    if (!article) return;
    const articleId = saveArticleForTab(article);
    if (!articleId) return;
    window.open(`/news/article/${articleId}`, '_blank', 'noopener,noreferrer');
  };

  const renderLoadingSkeleton = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3 h-[480px] rounded-2xl shimmer-loading" />
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="h-[148px] rounded-xl shimmer-loading" />
          <div className="h-[148px] rounded-xl shimmer-loading" />
          <div className="h-[148px] rounded-xl shimmer-loading" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="h-[250px] rounded-xl shimmer-loading" />
        <div className="h-[250px] rounded-xl shimmer-loading" />
        <div className="h-[250px] rounded-xl shimmer-loading" />
        <div className="h-[250px] rounded-xl shimmer-loading" />
      </div>
    </>
  );

  const renderErrorState = () => (
    <div className="rounded-2xl border border-white/10 bg-[#121212] p-10 text-center">
      <p className="font-titillium text-white text-xl font-semibold mb-6">News unavailable — check back soon</p>
      {errorHint && <p className="text-white/60 mb-6 text-sm">{errorHint}</p>}
      <button
        onClick={() => fetchNews(true)}
        className="inline-flex items-center rounded-md border border-[#E8002D] bg-[#E8002D] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:bg-[#bf0025]"
      >
        Refresh
      </button>
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-[#E8002D]" />
            <h2 className="font-titillium font-black text-white text-3xl uppercase">Editors' Picks</h2>
          </div>
          <Link to="/news" className="text-[#E8002D] font-titillium font-bold uppercase text-sm tracking-[0.12em] hover:text-white transition-colors">
            View All
          </Link>
        </div>

        {loading && renderLoadingSkeleton()}

        {!loading && (error || !featuredArticle) && renderErrorState()}

        {!loading && !error && featuredArticle && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
              <motion.article
                whileHover="hover"
                onClick={() => openArticle(featuredArticle)}
                className="lg:col-span-3 relative h-[480px] rounded-2xl overflow-hidden cursor-pointer border border-white/10"
              >
                <motion.img
                  variants={{ hover: { scale: 1.05 } }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  src={featuredArticle.image || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1400&q=80'}
                  alt={featuredArticle.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/35 to-black/95" />
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded text-white text-[11px] font-bold tracking-[0.1em]"
                  style={{ backgroundColor: featuredArticle.category.color }}
                >
                  {featuredArticle.category.label}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white/65 font-jetbrains text-xs mb-2">
                    {featuredArticle.sourceName} • {formatRelativeTime(featuredArticle.publishedAt)}
                  </p>
                  <h3 className="font-titillium font-black text-white text-3xl leading-tight line-clamp-3">
                    {featuredArticle.title}
                  </h3>
                </div>
              </motion.article>

              <div className="lg:col-span-2 flex flex-col gap-4">
                {stackedArticles.map((article) => (
                  <motion.article
                    key={article.id}
                    onClick={() => openArticle(article)}
                    whileHover={{ y: -3 }}
                    className="group flex gap-4 p-4 rounded-xl border border-white/10 bg-[#121212] cursor-pointer"
                  >
                    <img
                      src={article.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&q=80'}
                      alt={article.title}
                      className="w-[100px] h-[80px] rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-titillium text-[14px] font-medium leading-snug text-white line-clamp-2 transition-colors group-hover:text-[#E8002D]">
                        {article.title}
                      </h4>
                      <p className="mt-2 text-[12px] text-white/50 font-jetbrains">
                        {article.sourceName} • {formatRelativeTime(article.publishedAt)}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {gridArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => openArticle(article)}
                  className="group rounded-xl border border-white/10 bg-[#131313] overflow-hidden cursor-pointer"
                >
                  <div className="h-[55%] min-h-[140px] relative overflow-hidden">
                    <img
                      src={article.image || 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&q=80'}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-[2px] bg-[#E8002D]"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: index * 0.05 }}
                      style={{ originX: 0 }}
                    />
                  </div>
                  <div className="p-4">
                    <div
                      className="inline-block mb-2 px-2 py-1 rounded text-[10px] font-bold tracking-[0.08em] text-white"
                      style={{ backgroundColor: article.category.color }}
                    >
                      {article.category.label}
                    </div>
                    <h4 className="font-titillium text-[14px] font-bold text-white leading-snug line-clamp-2 mb-3">
                      {article.title}
                    </h4>
                    <p className="text-[12px] text-white/50 font-jetbrains">
                      {article.sourceName} • {formatRelativeTime(article.publishedAt)}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditorsPicks;
