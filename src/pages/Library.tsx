import { Bookmark, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Library() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-brand-dark p-6 md:p-10">
      
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-brand-light md:text-4xl">
          My Library
        </h1>
        <p className="mt-2 text-brand-gray">
          Movies and shows you've saved for later.
        </p>
      </header>

      {/* Empty State Container */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        
        {/* Glowing Icon Wrapper */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
          <Bookmark size={48} className="text-brand-gray/50" strokeWidth={1.5} />
        </div>
        
        <h2 className="mb-3 text-2xl font-bold text-brand-light">
          Your library is empty
        </h2>
        <p className="mb-8 max-w-md text-brand-gray">
          You haven't added any titles to your library yet. Browse the catalog to find your next favorite movie or show.
        </p>

        {/* Call to Action Button */}
        <button 
          onClick={() => navigate('/search')}
          className="flex items-center gap-2 rounded-md bg-white/10 px-8 py-3 font-medium text-brand-light transition-colors hover:bg-white/20 hover:text-white"
        >
          <Search size={20} />
          <span>Explore Titles</span>
        </button>
        
      </div>
    </div>
  );
}