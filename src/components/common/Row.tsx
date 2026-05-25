import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. Added routing hook
import MovieCard, { MovieCardProps } from './MovieCard';

// 2. Updated interface to accept mediaType for correct routing
export interface Movie extends MovieCardProps {
  id: string | number;
  mediaType?: 'movie' | 'tv';
}

interface RowProps {
  title: string;
  movies: Movie[];
}

export default function Row({ title, movies }: RowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 3. Initialize the navigate function
  const navigate = useNavigate();

  const handleScrollEvent = () => {
    if (rowRef.current) {
      setIsScrolled(rowRef.current.scrollLeft > 0);
    }
  };

  const slide = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="group/row relative w-full">
      
      <h2 className="mb-4 px-6 text-lg font-bold tracking-wide text-brand-light transition-colors hover:text-white md:px-10 md:text-xl lg:text-2xl">
        {title}
      </h2>

      <div className="relative">
        
        {/* Left Arrow */}
        <button
          onClick={() => slide('left')}
          className={`absolute left-0 top-0 z-40 flex h-[calc(100%-30px)] w-12 items-center justify-center bg-gradient-to-r from-brand-dark/90 to-transparent opacity-0 transition-all duration-300 hover:w-16 hover:text-brand-red group-hover/row:opacity-100 md:w-16 ${
            !isScrolled ? 'hidden' : ''
          }`}
        >
          <ChevronLeft className="h-8 w-8 transition-transform hover:scale-125" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={rowRef}
          onScroll={handleScrollEvent}
          className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4 md:gap-6 md:px-10"
        >
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id}
              title={movie.title}
              posterUrl={movie.posterUrl}
              year={movie.year}
              rating={movie.rating}
              // 4. Properly wired up! It reads the mediaType from Home.tsx and defaults to 'movie' if missing.
              onClick={() => navigate(`/title/${movie.mediaType || 'movie'}/${movie.id}`)} 
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => slide('right')}
          className="absolute right-0 top-0 z-40 flex h-[calc(100%-30px)] w-12 items-center justify-center bg-gradient-to-l from-brand-dark/90 to-transparent opacity-0 transition-all duration-300 hover:w-16 hover:text-brand-red group-hover/row:opacity-100 md:w-16"
        >
          <ChevronRight className="h-8 w-8 transition-transform hover:scale-125" />
        </button>

      </div>
    </div>
  );
}