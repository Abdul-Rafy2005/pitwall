const NEWS_STORAGE_PREFIX = 'pitwall.news.article.';

const sanitizeId = (value = '') => value.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 80);

const buildArticleId = (article) => {
  const base = `${article?.sourceName || 'source'}-${article?.publishedAt || Date.now()}-${article?.title || 'article'}`;
  return sanitizeId(base.replace(/\s+/g, '-').toLowerCase()) || String(Date.now());
};

export const saveArticleForTab = (article) => {
  if (!article) return null;
  const articleId = buildArticleId(article);
  const payload = { ...article, articleId, savedAt: Date.now() };

  try {
    localStorage.setItem(`${NEWS_STORAGE_PREFIX}${articleId}`, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to persist article for tab:', error);
  }

  return articleId;
};

export const getArticleFromTabStore = (articleId) => {
  if (!articleId) return null;
  try {
    const raw = localStorage.getItem(`${NEWS_STORAGE_PREFIX}${articleId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to read article from tab store:', error);
    return null;
  }
};
