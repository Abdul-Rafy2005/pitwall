import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

const youtubeApi = axios.create({
  baseURL: YOUTUBE_BASE_URL,
  params: {
    key: YOUTUBE_API_KEY,
  },
});

export const searchF1Videos = (query, maxResults = 10) => {
  return youtubeApi.get('/search', {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults,
    },
  });
};

export default youtubeApi;
