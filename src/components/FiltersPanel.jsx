import React from 'react';
import { Palette } from 'lucide-react';
import { FILTER_PRESETS } from '../utils/filters';

export function FiltersPanel({ effects, setEffects }) {
  return (
    <section className="studio-panel">
      <div className="panel-heading">
        <span className="panel-icon panel-icon-cool">
          <Palette className="h-4 w-4" />
        </span>
        <div>
          <h2>Filters</h2>
          <p>Realtime webcam looks</p>
        </div>
      </div>

      <div className="filter-grid">
        {FILTER_PRESETS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`filter-chip ${effects.filter === filter.id ? 'active' : ''}`}
            onClick={() => setEffects((current) => ({ ...current, filter: filter.id }))}
          >
            <span className={`filter-swatch filter-${filter.id}`} />
            <span>{filter.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
