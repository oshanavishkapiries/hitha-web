import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { FilterParams, Specialization } from '../types';
import Dropdown from './Dropdown';

interface SearchFilterModalProps {
  filters: FilterParams;
  onChange: (updates: Partial<FilterParams>) => void;
  onReset: () => void;
  onClose: () => void;
}

const specializations: Specialization[] = [
  'Counselor',
  'Clinical Counselor',
  'Psychologist',
  'Clinical Psychologist',
  'Medical Officer (Psychiatry Diploma)',
  'Consultant Psychiatrist',
];

const categoryOptions = [
  { value: '', label: 'All Specializations' },
  ...specializations.map((spec) => ({ value: spec, label: spec })),
];

const languages = ['Sinhala', 'Tamil', 'English'];
const languageOptions = [
  { value: '', label: 'All Languages' },
  ...languages.map((lang) => ({ value: lang, label: lang })),
];

const genders = ['Male', 'Female'];
const genderOptions = [
  { value: '', label: 'All Genders' },
  ...genders.map((gen) => ({ value: gen, label: gen })),
];

export default function SearchFilterModal({ filters, onChange, onReset, onClose }: SearchFilterModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      id="search-filter-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-card w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-elevated border border-hairline">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-hairline bg-cream/30 shrink-0">
          <span className="text-xs font-sans font-bold text-forest uppercase tracking-wider">
            Refine Directory Search
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-cream text-ink-soft hover:text-ink transition-all cursor-pointer"
            id="close-filter-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 space-y-5">
          {/* Specialization Category */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Category</label>
            <Dropdown
              id="filter-category"
              options={categoryOptions}
              value={filters.category || ''}
              onChange={(value) => onChange({ category: value as Specialization | '' })}
              placeholder="All Specializations"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Language</label>
              <Dropdown
                id="filter-language"
                options={languageOptions}
                value={filters.language || ''}
                onChange={(value) => onChange({ language: value })}
                placeholder="All Languages"
              />
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Gender</label>
              <Dropdown
                id="filter-gender"
                options={genderOptions}
                value={filters.gender || ''}
                onChange={(value) => onChange({ gender: value })}
                placeholder="All Genders"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Min Price LKR */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Min Price (LKR)</label>
              <input
                type="number"
                value={filters.minPrice === undefined ? '' : filters.minPrice}
                onChange={(e) => onChange({ minPrice: e.target.value === '' ? undefined : Number(e.target.value) })}
                placeholder="0"
                min="0"
                className="w-full bg-cream/30 hover:bg-cream/60 focus:bg-white text-xs text-ink rounded-sub px-3 py-2.5 border border-hairline focus:border-moss outline-none transition-all font-mono"
                id="filter-min-price"
              />
            </div>

            {/* Max Price LKR */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Max Price (LKR)</label>
              <input
                type="number"
                value={filters.maxPrice === undefined ? '' : filters.maxPrice}
                onChange={(e) => onChange({ maxPrice: e.target.value === '' ? undefined : Number(e.target.value) })}
                placeholder="10000"
                min="0"
                className="w-full bg-cream/30 hover:bg-cream/60 focus:bg-white text-xs text-ink rounded-sub px-3 py-2.5 border border-hairline focus:border-moss outline-none transition-all font-mono"
                id="filter-max-price"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-hairline bg-cream/20 shrink-0">
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 text-xs font-sans font-bold text-ink-soft hover:text-clay transition-colors cursor-pointer"
            id="reset-filters-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
          <button
            onClick={onClose}
            className="bg-forest hover:bg-forest/90 text-white font-sans font-semibold text-xs px-6 py-2.5 rounded-full transition-all shadow-resting cursor-pointer"
            id="apply-filters-btn"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
