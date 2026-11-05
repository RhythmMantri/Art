import React, { useState, useEffect } from 'react';

interface Props {
  categories: string[];
  counts?: Record<string, number>;
}

export default function GalleryFilter({ categories, counts }: Props) {
  const [active, setActive] = useState('All');

  useEffect(() => {
    // Handle URL hash on mount if present
    let hash = window.location.hash.replace('#', '').toLowerCase();
    const artFormAliases: Record<string, string> = {
      'indo-arabic': 'arabic',
      'rajasthani': 'bridal',
      'figure-portrait': 'bridal',
      'figures': 'bridal',
      'portrait': 'bridal',
      'figure': 'bridal',
    };
    if (hash && artFormAliases[hash]) {
      hash = artFormAliases[hash];
    }
    if (hash) {
      const match = categories.find((c) => c.toLowerCase() === hash);
      if (match) {
        handleFilter(match);
      }
    }
  }, [categories]);

  const handleFilter = (cat: string) => {
    setActive(cat);
    const selected = cat.toLowerCase();

    // Update URL hash
    if (selected === 'all') {
      history.replaceState(null, '', window.location.pathname);
    } else {
      history.replaceState(null, '', `#${selected}`);
    }

    // Toggle items via DOM
    const items = document.querySelectorAll<HTMLElement>('.gallery-item');
    items.forEach((item) => {
      const itemCat = item.getAttribute('data-category')?.toLowerCase();
      if (selected === 'all' || itemCat === selected) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  };

  return (
    <div className="gallery-filter-bar" role="tablist" aria-label="Gallery categories">
      {categories.map((cat) => {
        const isCurrent = active === cat;
        const count = counts ? counts[cat] : undefined;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isCurrent}
            className={`filter-btn ${isCurrent ? 'filter-btn--active' : ''}`}
            onClick={() => handleFilter(cat)}
          >
            <span>{cat}</span>
            {count !== undefined && <span className="filter-count">({count})</span>}
          </button>
        );
      })}
    </div>
  );
}
