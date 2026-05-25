export default function SkeletonCard({ layout = 'row' }: { layout?: 'row' | 'grid' }) {
  const widthClass = layout === 'grid' ? 'w-full' : 'w-[140px] md:w-[160px] lg:w-[200px]';

  return (
    <div className={`relative aspect-[2/3] shrink-0 animate-pulse overflow-hidden rounded-2xl bg-white/5 ${widthClass}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
      <div className="absolute right-2 top-2 h-4 w-8 rounded bg-white/10" />
    </div>
  );
}