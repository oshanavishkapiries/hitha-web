import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { navigateTo } from '../utils/navigation';
import { Specialization } from '../types';

export default function SearchHeroBar() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Specialization | ''>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [specSearch, setSpecSearch] = useState('');

  const specializations: Specialization[] = [
    'Counselor',
    'Clinical Counselor',
    'Psychologist',
    'Clinical Psychologist',
    'Medical Officer (Psychiatry Diploma)',
    'Consultant Psychiatrist',
  ];

  const filteredSpecs = specializations.filter((spec) =>
    spec.toLowerCase().includes(specSearch.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    navigateTo('/search', {
      name: name || undefined,
      category: category || undefined,
      page: 1,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 relative z-30">
      <form
        onSubmit={handleSearch}
        className="bg-ink border border-forest/80 rounded-[24px] lg:rounded-full p-4 lg:p-3 shadow-2xl grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row gap-3 items-stretch lg:items-center"
        id="hero-custom-search-form"
      >
        {/* Doctor Name Search Input */}
        <div className="relative lg:flex-1 w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sprout/60 flex items-center pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search Doctor Name"
            className="w-full bg-[#152B22] hover:bg-[#1A3429] focus:bg-[#1A3429] border border-[#2B4E41] focus:border-mint/50 rounded-[14px] lg:rounded-full pl-11 pr-4 py-3 lg:py-3.5 text-white text-sm outline-none transition-all placeholder:text-sprout/50 font-sans"
            id="hero-name-search-input"
          />
        </div>

        {/* Custom Specialization Dropdown Button */}
        <div className="relative lg:flex-1 w-full">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-[#152B22] hover:bg-[#1A3429] border border-[#2B4E41] hover:border-mint/40 rounded-[14px] lg:rounded-full px-5 py-3 lg:py-3.5 text-left text-sm text-white flex items-center justify-between cursor-pointer transition-all outline-none"
            id="hero-spec-dropdown-trigger"
          >
            <span className={category ? 'text-white font-medium' : 'text-sprout/50'}>
              {category || 'Select Specialization'}
            </span>
            {isDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-sprout/60 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-sprout/60 shrink-0" />
            )}
          </button>

          {/* Custom Dropdown Panel */}
          {isDropdownOpen && (
            <>
              {/* Backing screen overlay to close the dropdown */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-ink border border-[#2B4E41] rounded-[16px] shadow-2xl p-3 z-50 animate-fade-in flex flex-col gap-2"
                id="hero-spec-dropdown-panel"
              >
                {/* Search field within dropdown */}
                <div className="relative">
                  <input
                    type="text"
                    value={specSearch}
                    onChange={(e) => setSpecSearch(e.target.value)}
                    placeholder="Search specialization..."
                    className="w-full bg-[#152B22] border border-[#2B4E41] text-white text-xs rounded-[10px] px-3 py-2 outline-none focus:border-mint/50 placeholder:text-sprout/40"
                    id="hero-spec-search-input"
                    autoFocus
                  />
                </div>

                {/* Option items */}
                <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1">
                  {filteredSpecs.length > 0 ? (
                    filteredSpecs.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => {
                          setCategory(spec);
                          setIsDropdownOpen(false);
                          setSpecSearch('');
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-[10px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          category === spec
                            ? 'bg-mint text-mint-text font-semibold'
                            : 'text-white hover:bg-[#1A3429]'
                        }`}
                      >
                        <span>{spec}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sprout/40 text-xs">
                      No specializations found
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          className="bg-mint hover:bg-mint-dark text-mint-text font-sans font-bold text-sm px-6 py-3 lg:py-3.5 rounded-[14px] lg:rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform active:scale-95 flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          id="hero-submit-btn"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
}
