import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Bookmark, Heart, Search as SearchIcon, ArrowLeft } from 'lucide-react';
import Row from '../components/common/Row';
import { fetchFullDetails } from '../services/tmdb';

export default function Details() {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Defaulting to 'movie' if mediaType isn't in the URL for safety
        const details = await fetchFullDetails((mediaType as 'movie' | 'tv') || 'movie', id!);
        setData(details);
      } catch (error) {
        console.error("Failed to fetch details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadData();
  }, [id, mediaType]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-brand-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const title = data.title || data.name;
  const releaseYear = (data.release_date || data.first_air_date)?.substring(0, 4);
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : '';
  const rating = data.vote_average?.toFixed(1);
  const cast = data.credits?.cast?.slice(0, 10) || [];
  
  // Format recommendations for your existing Row component
  const recommendations = data.recommendations?.results
    ?.filter((m: any) => m.poster_path)
    .map((m: any) => ({
      id: m.id,
      title: m.title || m.name,
      posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      rating: m.vote_average
    })) || [];

  return (
    <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden bg-brand-dark pb-20 no-scrollbar">
      
      {/* ==========================================
          HERO BACKDROP SECTION
          ========================================== */}
      <div className="relative h-[55vh] min-h-[400px] w-full shrink-0 md:h-[65vh]">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 z-50 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/60 md:left-10"
        >
          <ArrowLeft size={24} />
        </button>

        <img
          src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
          alt={title}
          className="h-full w-full object-cover"
          draggable={false}
        />
        
        {/* Layered gradients to fade smoothly into the background */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent" />

        {/* Title positioned at the bottom left of the banner */}
        <div className="absolute bottom-6 left-6 z-10 max-w-4xl md:bottom-10 md:left-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-7xl">
            {title}
          </h1>
        </div>
      </div>

      {/* ==========================================
          CONTENT SECTION
          ========================================== */}
      <div className="relative z-10 -mt-2 px-6 md:px-10">
        
        {/* ACTION BUTTONS */}
        <div className="mb-8 flex gap-4 md:gap-6">
          <ActionButton 
            icon={<Play size={24} fill="currentColor" />} 
            label="Play" 
            primary 
            // WIRED UP: Navigates to the fullscreen player
            onClick={() => navigate(`/play/${mediaType || 'movie'}/${id}`)} 
          />
          <ActionButton icon={<Bookmark size={22} />} label="Library" />
          <ActionButton icon={<Heart size={22} />} label="Favorite" />
          <ActionButton icon={<SearchIcon size={22} />} label="Search" />
        </div>

        {/* METADATA PILLS */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm font-medium text-brand-light">
          {/* Mock Provider Pill */}
          <span className="rounded bg-white px-1.5 py-0.5 text-xs font-bold text-black">
            CineTmdb
          </span>
          {/* Mock Rating Pill */}
          <span className="rounded border border-white/30 px-1.5 py-0.5 text-xs font-bold">
            PG-13
          </span>
          <span>{mediaType === 'tv' ? 'TV Series' : 'Movie'}</span>
          {releaseYear && <span>{releaseYear}</span>}
          {rating && <span>{rating}/10.0</span>}
          {runtime && <span>{runtime}</span>}
        </div>

        {/* SYNOPSIS */}
        <p className="mb-6 max-w-4xl text-base leading-relaxed text-brand-light/90 md:text-lg">
          {data.overview}
        </p>

        {/* GENRE PILLS */}
        <div className="mb-10 flex flex-wrap gap-2">
          {data.genres?.map((g: any) => (
            <span key={g.id} className="cursor-pointer rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-light transition-colors hover:bg-white/20">
              {g.name}
            </span>
          ))}
        </div>

        {/* CAST LIST */}
        {cast.length > 0 && (
          <div className="mb-12">
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {cast.map((actor: any) => (
                <div key={actor.id} className="flex w-[80px] shrink-0 flex-col items-center text-center">
                  <div className="mb-2 h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-brand-black/50 md:h-20 md:w-20">
                    {actor.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                        alt={actor.name}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-brand-gray">
                        {actor.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="line-clamp-2 text-sm font-bold text-brand-light">{actor.name}</span>
                  <span className="line-clamp-1 text-xs text-brand-gray">{actor.character}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECOMMENDED ROW */}
        {recommendations.length > 0 && (
          <div className="-mx-6 md:-mx-10">
            <Row title="Recommended" movies={recommendations} />
          </div>
        )}

      </div>
    </div>
  );
}

// Reusable micro-component for the Action Buttons
function ActionButton({ 
  icon, 
  label, 
  primary = false, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  primary?: boolean, 
  onClick?: () => void 
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        onClick={onClick}
        className={`flex h-12 w-16 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 md:h-14 md:w-20 ${
          primary 
            ? 'bg-brand-light text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
            : 'bg-white/10 text-brand-light hover:bg-white/20'
        }`}
      >
        {icon}
      </button>
      <span className="text-xs font-medium text-brand-light">{label}</span>
    </div>
  );
}