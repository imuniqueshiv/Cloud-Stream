import { Star } from 'lucide-react';

export interface MovieCardProps {
  title: string;
  posterUrl: string;
  rating?: number;
  year?: string | number; // Added year prop
  layout?: 'row' | 'grid';
  onClick?: () => void;
}

export default function MovieCard({ 
  title, 
  posterUrl, 
  rating, 
  year, 
  layout = 'row', 
  onClick 
}: MovieCardProps) {
  // Use w-full for grid so it stretches dynamically, otherwise use fixed widths for the horizontal rows
  const widthClass = layout === 'grid' ? 'w-full' : 'w-[130px] md:w-[150px] lg:w-[170px]';

  return (
    <div 
      onClick={onClick} 
      className={`group/card relative flex shrink-0 cursor-pointer flex-col gap-2 transition-all duration-500 ease-out hover:scale-105 hover:z-20 will-change-transform ${widthClass}`}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-brand-black/20 shadow-md transition-shadow duration-500 group-hover/card:shadow-2xl group-hover/card:shadow-black/60">
        <img
          src={posterUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-110"
          loading="lazy"
          draggable={false}
        />
        
        {/* Top Right Rating Badge */}
        {rating && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-brand-black/80 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md shadow-sm">
            <span>{rating.toFixed(1)}</span>
            <Star size={10} className="fill-brand-red text-brand-red drop-shadow-md" />
          </div>
        )}
      </div>

      {/* Title & Metadata Below Poster */}
      <div className="flex flex-col">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-brand-light transition-colors duration-300 group-hover/card:text-white">
          {title}
        </h3>
        
        {/* Display Year if available */}
        {year && (
          <span className="mt-0.5 text-xs text-brand-gray transition-colors duration-300 group-hover/card:text-brand-light/80">
            {year}
          </span>
        )}
      </div>
    </div>
  );
}