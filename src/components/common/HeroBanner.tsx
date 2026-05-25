export interface HeroBannerProps {
  title: string;
  description: string;
  backdropUrl: string;
  logoUrl?: string;
  rating?: number;
  year?: number;
  duration?: string;
  cast?: string;
  genres?: string[];
}

export default function HeroBanner({
  title, description, backdropUrl, logoUrl, rating, year, duration, cast, genres
}: HeroBannerProps) {
  return (
    <div className="relative h-[60vh] min-h-[450px] w-full shrink-0">
      <img src={backdropUrl} alt={title} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
      <div className="absolute inset-0 gradient-fade-bottom" />

      <div className="absolute bottom-[10%] left-0 z-10 flex w-full flex-col justify-end px-6 md:w-2/3 md:px-10 lg:w-1/2">
        {logoUrl ? (
          <img src={logoUrl} alt={title} className="mb-4 w-[60%] max-w-[400px] drop-shadow-2xl" draggable={false} />
        ) : (
          <h1 className="mb-4 text-4xl font-extrabold text-white">{title}</h1>
        )}

        {/* Metadata Row */}
        <div className="mb-4 flex items-center gap-3 text-sm font-medium text-brand-light">
          {rating && (
            <span className="rounded bg-yellow-500 px-2 py-0.5 text-black">Rating: {rating}</span>
          )}
          {year && <span>{year}</span>}
          {duration && <span>{duration}</span>}
        </div>

        <p className="mb-2 line-clamp-3 max-w-2xl text-sm text-brand-light/90 md:text-base">
          {description}
        </p>

        {cast && (
          <p className="mb-6 text-sm text-brand-gray">
            <span className="font-medium text-brand-light">Cast:</span> {cast}
          </p>
        )}

        {/* Genre Pills */}
        <div className="flex flex-wrap gap-2">
          {genres?.map((genre) => (
            <span key={genre} className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-light transition-colors hover:bg-white/20 cursor-pointer">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}