import { useEffect, useState } from 'react';
import HeroBanner from '../components/common/HeroBanner';
import Row from '../components/common/Row';
import { useNavigate } from 'react-router-dom';
import { 
  fetchTrendingMovies, 
  fetchTrendingShows, 
  fetchTrendingAnime, 
  fetchAiringAnime, 
  fetchKoreanShows,
  fetchMovieDetails
} from '../services/tmdb';

export default function Home() {
  const [heroData, setHeroData] = useState<any>(null);
  const [rows, setRows] = useState<{ title: string; movies: any[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [movies, shows, anime, airingAnime, kDrama] = await Promise.all([
          fetchTrendingMovies(),
          fetchTrendingShows(),
          fetchTrendingAnime(),
          fetchAiringAnime(),
          fetchKoreanShows()
        ]);

        const formatData = (data: any) => 
          data.results.map((m: any) => ({
            id: m.id,
            title: m.title || m.name,
            posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
            rating: m.vote_average
          })).filter((m: any) => m.posterUrl && !m.posterUrl.endsWith('null'));

        setRows([
          { title: "Trending Movies Today", movies: formatData(movies) },
          { title: "Trending Shows Today", movies: formatData(shows) },
          { title: "Trending Anime Today", movies: formatData(anime) },
          { title: "Airing Anime Today", movies: formatData(airingAnime) },
          { title: "Trending Korean Shows", movies: formatData(kDrama) }
        ]);

        const topMovie = movies.results[0];
        if (topMovie) {
          const details = await fetchMovieDetails(topMovie.id);
          
          setHeroData({
            title: details.title || details.name,
            description: details.overview,
            backdropUrl: `https://image.tmdb.org/t/p/original${details.backdrop_path}`,
            rating: Number(details.vote_average?.toFixed(1)),
            year: details.release_date ? new Date(details.release_date).getFullYear() : null,
            duration: details.runtime ? `${details.runtime} min` : null,
            cast: details.credits?.cast?.slice(0, 3).map((c: any) => c.name).join(', '),
            genres: details.genres?.map((g: any) => g.name)
          });
        }

      } catch (error) {
        console.error("Failed to load TMDb data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  return (
    <div className="min-h-full w-full bg-brand-dark pb-10">
      
      {/* Hero Section */}
      {isLoading || !heroData ? (
        <div className="h-[60vh] min-h-[450px] w-full animate-pulse bg-white/5" />
      ) : (
        <HeroBanner 
          {...heroData} 
          onPlay={() => console.log(`Playing ${heroData.title}`)}
          onMoreInfo={() => console.log(`More info for ${heroData.title}`)}
        />
      )}

      {/* Content Rows 
          FIX APPLIED HERE: 
          Removed `-mt-10` and `-mt-16`. 
          Added `pt-6 md:pt-10` to push the rows down, clearing the Hero Banner text 
          and allowing the movie cards to scale upwards without clipping.
      */}
      <div className="relative z-10 pt-6 flex flex-col gap-8 md:pt-2 md:gap-10">
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-brand-gray">
            <span className="animate-pulse text-lg">Loading catalog from TMDb...</span>
          </div>
        ) : (
          rows.map((row) => (
            row.movies.length > 0 && (
              <Row 
                key={row.title} 
                title={row.title} 
                movies={row.movies} 
              />
            )
          ))
        )}
        
      </div>
    </div>
  );
}