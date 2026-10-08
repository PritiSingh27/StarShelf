import { useState } from 'react';

export default function StoreStamp({
  name = 'Brew & Bound',
  category = 'Café & books',
  neighbourhood = 'OLD TOWN',
  rating = 4.8,
  reviewCount = 120,
  isSaved = false,
  image = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
  onSaveToggle,
  onClick,
  rotation = 0,
  className = '',
}) {
  const [animating, setAnimating] = useState(false);

  const handleStampClick = (e) => {
    e.stopPropagation();
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    if (onSaveToggle) {
      onSaveToggle(!isSaved);
    }
  };

  const formattedRating = Number(rating || 0).toFixed(1);

  return (
    <article
      tabIndex={0}
      onClick={onClick}
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`stamp-perforated stamp-hover-lift cursor-pointer relative p-3 border border-line rounded-sm select-none flex flex-col justify-between overflow-hidden shadow-sm ${className}`}
      aria-label={`Postage stamp for ${name}, rating ${formattedRating} out of 5 stars`}
    >
      <div className="absolute inset-1.5 border border-line/60 pointer-events-none z-10" />

      <div className="relative z-0">
        <div className="bg-brand text-white px-2.5 py-1 text-center font-bold text-xs uppercase tracking-widest rounded-xs mb-2">
          {typeof category === 'string' ? category : category?.name || 'STORE'}
        </div>

        <div className="flex items-start justify-between gap-2 px-1">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="stamp-font-title text-xl sm:text-2xl text-ink leading-tight font-extrabold truncate">
              {name}
            </h3>
          </div>

          <div className="text-right flex flex-col items-end">
            <span
              className="stamp-font-title text-3xl sm:text-4xl font-black text-secondary leading-none tabular-nums"
              aria-label={`Rating ${formattedRating}`}
            >
              {formattedRating}
            </span>
            <span className="stamp-font-body text-[10px] text-muted uppercase tracking-wider font-semibold">
              {reviewCount} reviews
            </span>
          </div>
        </div>

        <div className="mt-3 relative h-36 sm:h-40 w-full overflow-hidden border border-line/40 rounded-xs bg-bg/50">
          <img
            src={image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80'}
            alt={`Illustration of ${name}`}
            className="w-full h-full object-cover filter contrast-105"
            loading="lazy"
          />
        </div>
      </div>

      {(isSaved || animating) && (
        <div
          className={`absolute bottom-6 right-2 pointer-events-none z-20 ${
            animating ? 'animate-thunk' : 'opacity-75 -rotate-6'
          }`}
          aria-label="Postmark stamp verified"
        >
          <svg className="w-28 h-28 text-secondary overflow-visible" viewBox="0 0 100 100">
            <path id={`circlePath-${name.replace(/\s+/g, '')}`} d="M 20,50 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" fill="none" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M 0,40 Q 20,35 40,40 T 80,40 T 120,40" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 0,50 Q 20,45 40,50 T 80,50 T 120,50" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 0,60 Q 20,55 40,60 T 80,60 T 120,60" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text fill="currentColor" fontSize="7" fontWeight="bold" letterSpacing="1.5">
              <textPath href={`#circlePath-${name.replace(/\s+/g, '')}`} startOffset="50%" textAnchor="middle">
                {neighbourhood.toUpperCase()} • COLLECTED
              </textPath>
            </text>
          </svg>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-line/60 flex items-center justify-between px-1">
        <span className="stamp-font-body text-[11px] font-semibold tracking-widest text-muted uppercase">
          {neighbourhood}
        </span>
        <button
          type="button"
          onClick={handleStampClick}
          className="text-xs px-2.5 py-1 rounded bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold transition-colors"
          title={isSaved ? 'Remove from collection' : 'Collect stamp'}
        >
          {isSaved ? 'Stamped' : 'Stamp'}
        </button>
      </div>
    </article>
  );
}
