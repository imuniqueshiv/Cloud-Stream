const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Reusable fetcher
const fetchTMDB = async (endpoint: string) => {
  const separator = endpoint.includes('?') ? '&' : '?';
  const response = await fetch(`${BASE_URL}${endpoint}${separator}api_key=${API_KEY}`);
  if (!response.ok) throw new Error(`TMDb API error: ${response.status}`);
  return response.json();
};

// Row Fetches
export const fetchTrendingMovies = () => fetchTMDB('/trending/movie/day');
export const fetchTrendingShows = () => fetchTMDB('/trending/tv/day');
export const fetchTrendingAnime = () => fetchTMDB('/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc');
export const fetchAiringAnime = () => fetchTMDB('/tv/on_the_air?with_original_language=ja&with_genres=16');
export const fetchKoreanShows = () => fetchTMDB('/discover/tv?with_original_language=ko&sort_by=popularity.desc');

// Hero Details Fetch (Needed to get runtime, cast, and genres for the hero banner)
export const fetchMovieDetails = (movieId: string | number) => fetchTMDB(`/movie/${movieId}?append_to_response=credits`);

// Fetch full details, cast, and recommendations in a single call
export const fetchFullDetails = (mediaType: 'movie' | 'tv', id: string | number) => 
  fetchTMDB(`/${mediaType}/${id}?append_to_response=credits,recommendations`);