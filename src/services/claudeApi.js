// Claude/AI API calls must go through the Spring Boot backend — never call
// any AI provider directly from the browser because the API key would be
// embedded in the compiled JS bundle and visible to anyone in DevTools.
// Route through: frontend → /api/commentary/* → GroqService (backend)

export const generateCommentary = async (_raceData) => {
  throw new Error('Use /api/commentary/live on the backend instead.');
};

export default null;
