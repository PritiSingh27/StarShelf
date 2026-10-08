import { useState } from 'react';
import { X, Clock, MapPin, Tag, Star, MessageSquare } from 'lucide-react';
import StoreStamp from './StoreStamp.jsx';
import StarRating from './StarRating.jsx';

export default function StoreDetailModal({ store, onClose, onRateSubmit, isSaved, onSaveToggle }) {
  const [userRating, setUserRating] = useState(store?.userRating || 0);
  const [userComment, setUserComment] = useState(store?.userComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!store) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userRating) return;
    setIsSubmitting(true);
    try {
      await onRateSubmit(store.id, userRating, userComment);
    } finally {
      setIsSubmitting(false);
    }
  };

  const samplePhotos = [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80',
  ];

  const sampleTags = store.tags || ['Single origin', 'Quiet corner', 'Books & Coffee', 'Cozy Ambience'];

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface border border-line rounded-lg shadow-2xl overflow-hidden my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-bg/80 hover:bg-bg text-ink transition-colors"
          aria-label="Close store details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <StoreStamp
                name={store.name}
                category={typeof store.category === 'string' ? store.category : store.category?.name || 'STORE'}
                neighbourhood={store.neighbourhood || 'OLD TOWN'}
                rating={store.rating || store.overallRating || 4.8}
                reviewCount={store.reviewCount || store.totalRatings || 120}
                isSaved={isSaved}
                image={store.image}
                onSaveToggle={onSaveToggle}
                rotation={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2 p-3 rounded bg-bg/60 border border-line/60">
              <Clock className="w-4 h-4 text-secondary shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider block text-[10px] text-muted">Operating Hours</span>
                <span className="font-semibold text-ink">{store.hours || 'Open until 10:00 PM'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded bg-bg/60 border border-line/60">
              <MapPin className="w-4 h-4 text-secondary shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider block text-[10px] text-muted">Location Address</span>
                <span className="font-semibold text-ink truncate block">{store.address}</span>
              </div>
            </div>
          </div>

          <div>
            <span className="stamp-font-body text-xs font-bold uppercase tracking-widest text-muted mb-2 block">
              Specialties & Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleTags.map((tag) => (
                <span
                  key={tag}
                  className="stamp-perforated px-3 py-1 text-xs font-bold text-ink border border-line bg-surface flex items-center gap-1 shadow-2xs"
                >
                  <Tag className="w-3 h-3 text-secondary" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="stamp-font-body text-xs font-bold uppercase tracking-widest text-muted mb-3 block">
              Perforated Gallery Frames
            </span>
            <div className="grid grid-cols-3 gap-3">
              {samplePhotos.map((photoUrl, idx) => (
                <div key={idx} className="stamp-perforated p-1 border border-line bg-surface shadow-2xs">
                  <img
                    src={photoUrl}
                    alt={`Store frame ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-2xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 rounded-md border border-line bg-bg/40 space-y-3">
            <h4 className="stamp-font-title text-base text-ink">Submit Your Rating & Philatelist Stamp Review</h4>
            <div className="flex items-center gap-3">
              <StarRating value={userRating} onChange={setUserRating} size="lg" />
              <span className="text-xs font-bold text-secondary">
                {userRating ? `${userRating} / 5 Stars` : 'Tap to rate'}
              </span>
            </div>
            <textarea
              rows={3}
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Write your review postcard comment (up to 500 characters)..."
              maxLength={500}
              className="w-full p-2.5 text-xs rounded border border-line bg-surface text-ink focus:outline-none"
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">{500 - userComment.length} characters left</span>
              <button
                type="submit"
                disabled={!userRating || isSubmitting}
                className="px-4 py-2 rounded bg-secondary hover:bg-secondary/90 text-white font-bold disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Postcard Review'}
              </button>
            </div>
          </form>

          <div>
            <span className="stamp-font-body text-xs font-bold uppercase tracking-widest text-muted mb-3 block">
              Postcard Reviews (Ink Feel)
            </span>
            <div className="space-y-3">
              <div className="p-4 rounded bg-[#FFFDF5] dark:bg-[#1A1429] border border-line shadow-2xs space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink">Collector #1042</span>
                  <div className="flex items-center gap-1 text-secondary font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" /> 5.0
                  </div>
                </div>
                <p className="font-mono italic text-xs text-ink/90 leading-relaxed">
                  "Wonderful quiet atmosphere with rare single origin brews. Perfect corner for reading."
                </p>
                <div className="text-[10px] font-mono text-muted text-right">Oct 08, 2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
