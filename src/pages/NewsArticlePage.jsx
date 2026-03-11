import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getArticleFromTabStore } from '../services/newsTabStore';

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const NewsArticlePage = () => {
  const { articleId } = useParams();
  const article = getArticleFromTabStore(articleId);

  if (!article) {
    return (
      <div className="min-h-[70vh] bg-[#0a0a0a] px-4 py-24 text-white md:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#141414] p-10 text-center">
          <h1 className="font-titillium text-3xl font-black uppercase">Article Not Available</h1>
          <p className="mt-4 text-white/60">Open this article again from Editors&apos; Picks to load it in PitWall.</p>
          <Link
            to="/"
            className="mt-8 inline-flex rounded-md border border-[#E8002D] bg-[#E8002D] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c20025]"
          >
            Back To Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-[#0a0a0a] pb-20 pt-20 text-white">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#E8002D]">PitWall News</p>
        <h1 className="font-titillium text-4xl font-black uppercase leading-tight md:text-6xl">{article.title}</h1>
        <p className="mt-4 text-sm text-white/60">
          {article.sourceName} • {formatDate(article.publishedAt)}
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <img
            src={article.image || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1400&q=80'}
            alt={article.title}
            className="h-[420px] w-full object-cover"
          />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#131313] p-8">
          {article.description && <p className="mb-6 text-lg text-white/90">{article.description}</p>}
          {article.content && <p className="mb-8 whitespace-pre-line text-white/75">{article.content}</p>}

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
              className="rounded-md border border-[#E8002D] bg-[#E8002D] px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#c20025]"
            >
              Read Original Source
            </button>
            <Link
              to="/"
              className="rounded-md border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/10"
            >
              Back To Home
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsArticlePage;
