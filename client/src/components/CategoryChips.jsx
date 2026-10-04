export default function CategoryChips({ categories = [], selectedCategory, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
          selectedCategory === null
            ? 'bg-brand-soft text-brand-text border-brand/30'
            : 'bg-surface text-muted border-line hover:text-ink'
        }`}
      >
        All Stores
      </button>
      {categories.map((cat) => {
        const isSelected = Number(selectedCategory) === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
              isSelected
                ? 'bg-brand-soft text-brand-text border-brand/30'
                : 'bg-surface text-muted border-line hover:text-ink'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
