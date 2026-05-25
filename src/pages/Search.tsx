import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, SlidersHorizontal, Mic, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import MovieCard from '../components/common/MovieCard';
import SkeletonCard from '../components/common/SkeletonCard';

const TABS = ['Movies', 'TV Series', 'Anime', 'Asian Dramas', 'Livestreams', 'Torrents'];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'year', label: 'Newest First' },
  { value: 'title', label: 'A - Z' }
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(TABS[0]);
  
  const [sortBy, setSortBy] = useState('relevance');
  const [isSortOpen, setIsSortOpen] = useState(false); // NEW: Controls custom dropdown visibility
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      
      try {
        const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
        
        const endpoint = searchQuery.trim() === '' 
          ? `/trending/all/day?api_key=${API_KEY}`
          : `/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`;

        const response = await fetch(`${BASE_URL}${endpoint}`);
        const data = await response.json();

        if (data.results) {
          const formattedData = data.results
            .filter((m: any) => m.poster_path && m.media_type !== 'person') 
            .map((m: any) => ({
              id: m.id,
              mediaType: m.media_type || 'movie', 
              title: m.title || m.name,
              posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
              rating: m.vote_average,
              year: (m.release_date || m.first_air_date)?.substring(0, 4)
            }));

          setSearchResults(formattedData);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeTab]); 

  const sortedResults = [...searchResults].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'year') {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      return yearB - yearA;
    }
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0; 
  });

  return (
    <div className="flex h-full flex-col bg-brand-dark">
      <header className="sticky top-0 z-40 flex flex-col bg-brand-dark/95 px-6 pt-6 pb-2 backdrop-blur-xl md:px-10">
        <div className="flex items-center gap-4">
          <button className="hidden text-brand-light transition-colors hover:text-brand-red sm:block">
            <Mic size={24} />
          </button>

          <div className="group relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray transition-colors group-focus-within:text-brand-light" size={22} />
            <input
              type="text"
              placeholder="Movies, TV Series, Anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full select-auto rounded-full bg-white/5 py-3 pl-12 pr-12 text-lg text-brand-light placeholder-brand-gray outline-none transition-all focus:bg-white/10 focus:ring-1 focus:ring-brand-red"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray transition-colors hover:text-brand-light">
                <X size={20} />
              </button>
            )}
          </div>

          <button className="text-brand-light transition-colors hover:text-brand-red">
            <SlidersHorizontal size={24} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeTab === tab ? 'bg-brand-red text-white shadow-md' : 'text-brand-gray hover:bg-white/10 hover:text-brand-light' 
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-x-hidden p-6 md:p-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-xl font-bold text-brand-light">
            {searchQuery ? `Results for "${searchQuery}"` : 'Trending Now'}
          </h2>
          
          <div className="flex items-center gap-4">
            {!isLoading && searchResults.length > 0 && (
              <span className="hidden text-sm text-brand-gray sm:block">
                {searchResults.length} titles found
              </span>
            )}
            
            {/* ==========================================
                NEW CUSTOM THEMED DROPDOWN
                ========================================== */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-gray">Sort:</span>
              
              <div className="relative">
                {/* Dropdown Toggle Button */}
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 rounded-md border border-white/10 bg-brand-black px-3 py-1.5 text-sm text-brand-light outline-none transition-colors hover:bg-white/5 focus:border-brand-red"
                >
                  {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Invisible overlay to close dropdown when clicking outside */}
                {isSortOpen && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsSortOpen(false)}
                  />
                )}

                {/* Dropdown Menu */}
                {isSortOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-md border border-white/10 bg-brand-black shadow-xl">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-brand-red hover:text-white ${
                          sortBy === option.value ? 'bg-white/5 text-brand-light' : 'text-brand-gray'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4 gap-y-8 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] md:gap-6 md:gap-y-10 lg:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
          
          {isLoading ? (
            Array.from({ length: 18 }).map((_, i) => (
              <SkeletonCard key={`skel-${i}`} layout="grid" />
            ))
          ) : sortedResults.length > 0 ? (
            sortedResults.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                posterUrl={movie.posterUrl}
                rating={movie.rating}
                year={movie.year}
                layout="grid" 
                onClick={() => navigate(`/title/${movie.mediaType}/${movie.id}`)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center pt-20 text-brand-gray">
              <SearchIcon size={48} className="mb-4 opacity-20" />
              <p className="text-lg">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}