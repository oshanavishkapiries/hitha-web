import React, { useState, useEffect, useMemo } from 'react';
import { FilterParams } from '../types';
import { getQueryParams, updateUrlQueryParams, navigateTo } from '../utils/navigation';
import { useDiscoverDoctors } from '../lib/service/query/useDiscovery';
import DoctorDetailModal from './DoctorDetailModal';
import SearchFilterModal from './SearchFilterModal';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  X,
} from 'lucide-react';

const HERO_BG_IMAGE = 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1600&auto=format&fit=crop';
const DOCTOR_FALLBACK_IMAGE = 'https://placehold.co/400x400/EDE8DA/1E4B3A?text=Dr';

export default function SearchPage() {
  const [filters, setFilters] = useState<FilterParams>({
    name: '',
    category: '',
    language: '',
    gender: '',
    minPrice: undefined,
    maxPrice: undefined,
    page: 1,
  });
  const [nameInput, setNameInput] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Synchronize filters on mount & back/forward browser navigation
  useEffect(() => {
    const initial = getQueryParams();
    setFilters(initial);
    setNameInput(initial.name || '');

    const handlePopState = () => {
      const next = getQueryParams();
      setFilters(next);
      setNameInput(next.name || '');
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Debounce the free-text name search before it hits the API/URL
  useEffect(() => {
    const handle = setTimeout(() => {
      if (nameInput !== (filters.name || '')) {
        handleFilterChange({ name: nameInput });
      }
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameInput]);

  // Handle filter state changes and update URL query params
  const handleFilterChange = (updates: Partial<FilterParams>) => {
    const nextFilters = { ...filters, ...updates, page: 1 }; // Reset page on filter change
    setFilters(nextFilters);
    updateUrlQueryParams(nextFilters);
  };

  const handleResetFilters = () => {
    const cleared: FilterParams = {
      name: '',
      category: '',
      language: '',
      gender: '',
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
    };
    setFilters(cleared);
    setNameInput('');
    updateUrlQueryParams(cleared);
  };

  const handlePageChange = (newPage: number) => {
    const nextFilters = { ...filters, page: newPage };
    setFilters(nextFilters);
    updateUrlQueryParams(nextFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageSize = filters.size || 6;
  const currentPage = filters.page || 1;

  const { data, isLoading, isFetching, isError } = useDiscoverDoctors({
    name: filters.name || undefined,
    category: filters.category || undefined,
    language: filters.language || undefined,
    gender: filters.gender || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    page: currentPage - 1, // backend is 0-indexed
    size: pageSize,
  });

  const doctors = data?.doctors || [];
  const totalResults = data?.pagination?.totalElements ?? 0;
  const totalPages = data?.pagination?.totalPages || 1;

  // Chips describing every active filter besides the free-text name search
  const activeChips = useMemo(() => {
    const chips: { key: keyof FilterParams; label: string }[] = [];
    if (filters.category) chips.push({ key: 'category', label: filters.category });
    if (filters.language) chips.push({ key: 'language', label: `Speaks ${filters.language}` });
    if (filters.gender) chips.push({ key: 'gender', label: filters.gender });
    if (filters.minPrice !== undefined) chips.push({ key: 'minPrice', label: `Min LKR ${filters.minPrice.toLocaleString()}` });
    if (filters.maxPrice !== undefined) chips.push({ key: 'maxPrice', label: `Max LKR ${filters.maxPrice.toLocaleString()}` });
    return chips;
  }, [filters]);

  const removeChip = (key: keyof FilterParams) => {
    if (key === 'minPrice' || key === 'maxPrice') {
      handleFilterChange({ [key]: undefined });
    } else {
      handleFilterChange({ [key]: '' } as Partial<FilterParams>);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ink to-forest text-white pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <img
            src={HERO_BG_IMAGE}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top opacity-20 mix-blend-luminosity"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
            }}
          />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-mint rounded-full filter blur-[120px] opacity-10" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sprout rounded-full filter blur-[100px] opacity-10" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          {/* Breadcrumb / Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-sans font-bold text-sprout/80 uppercase tracking-wider">
                <button onClick={() => navigateTo('/')} className="hover:text-mint transition-colors">Hitha</button>
                <span>/</span>
                <span className="text-white font-semibold">Specialist Directory</span>
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mt-2 tracking-tight">
                Find a Specialist
              </h1>
              <p className="text-xs sm:text-sm text-sprout/80 mt-1.5 max-w-xl">
                Browse certified practitioners to view their qualifications, available slots, and patient reviews.
              </p>
            </div>
          </div>

          {/* Search + Filters Pill */}
          <div
            className="bg-ink border border-forest/80 rounded-[24px] sm:rounded-full p-3 shadow-2xl flex flex-col sm:flex-row gap-3 items-stretch"
            id="search-pill"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sprout/60 w-4 h-4" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Search Doctor Name"
                className="w-full bg-[#12283C] hover:bg-[#1A3752] focus:bg-[#1A3752] border border-[#204566] focus:border-mint/50 rounded-[14px] sm:rounded-full pl-11 pr-4 py-3 text-white text-sm outline-none transition-all placeholder:text-sprout/50 font-sans"
                id="filter-name"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="relative shrink-0 bg-[#12283C] hover:bg-[#1A3752] border border-[#204566] hover:border-mint/40 rounded-[14px] sm:rounded-full px-5 py-3 text-sm text-white flex items-center justify-center gap-2 cursor-pointer transition-all outline-none"
              id="open-filters-btn"
            >
              <SlidersHorizontal className="w-4 h-4 text-sprout/70" />
              <span className="font-sans font-medium">Filters</span>
              {activeChips.length > 0 && (
                <span className="bg-mint text-mint-text text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>

          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => removeChip(chip.key)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-sans font-medium rounded-full pl-3 pr-2 py-1.5 transition-colors cursor-pointer"
                >
                  <span>{chip.label}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-sans font-bold text-sprout/70 hover:text-white underline transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Directory Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex justify-between items-center px-1">
          <p className="text-xs text-ink-soft font-medium">
            {totalResults > 0 ? (
              <>
                Showing <span className="text-forest font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="text-forest font-semibold">{Math.min(currentPage * pageSize, totalResults)}</span>{' '}
                of <span className="text-forest font-bold">{totalResults}</span> certified therapists
              </>
            ) : (
              'No certified therapists to show'
            )}
            {isFetching && !isLoading && <span className="ml-2 text-ink-faint">Refreshing…</span>}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-ink-soft">
            <Loader2 className="w-8 h-8 animate-spin text-moss" />
            <p className="text-xs font-sans">Loading specialists...</p>
          </div>
        ) : isError ? (
          <div className="bg-[#F4E2DD] border border-clay/20 rounded-card p-10 text-center space-y-4 max-w-xl mx-auto">
            <AlertTriangle className="w-12 h-12 text-clay mx-auto" />
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-clay">Unable to Load Directory</h3>
              <p className="text-xs text-ink-soft leading-relaxed max-w-md mx-auto">
                Something went wrong while fetching specialists. Please try again shortly.
              </p>
            </div>
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                className="bg-white rounded-card border border-hairline shadow-resting hover:shadow-elevated transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex gap-4 p-4"
                id={`doctor-card-${doc.id}`}
              >
                {/* Square profile image */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-2xl bg-cream/60 overflow-hidden">
                  <img
                    src={doc.profilePicture || DOCTOR_FALLBACK_IMAGE}
                    alt={`${doc.firstName} ${doc.lastName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div className="space-y-1.5">
                    <h3 className="font-display font-semibold text-base sm:text-lg text-forest leading-tight truncate">
                      Dr. {doc.firstName} {doc.lastName}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {doc.languages.map((lang) => (
                        <span
                          key={lang}
                          className="text-[10px] font-sans font-semibold text-forest bg-cream px-2 py-0.5 rounded-full border border-hairline"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {doc.startingPrice != null ? (
                      <span className="inline-flex items-center rounded-full border border-sprout/60 bg-sprout/20 px-3 py-1 text-[11px] font-mono font-bold text-forest">
                        LKR {doc.startingPrice.toLocaleString()}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-hairline bg-cream px-3 py-1 text-[10px] font-sans italic text-ink-faint">
                        No slots yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F4E2DD] border border-clay/20 rounded-card p-10 text-center space-y-4 max-w-xl mx-auto">
            <ShieldAlert className="w-12 h-12 text-clay mx-auto" />
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-clay">No Specialists Found</h3>
              <p className="text-xs text-ink-soft leading-relaxed max-w-md mx-auto">
                No clinicians matched your precise search parameters. Try lowering minimum pricing constraints or clearing filters to see more Sri Lankan consultants.
              </p>
            </div>
            <div>
              <button
                onClick={handleResetFilters}
                className="bg-forest hover:bg-forest/90 text-white font-sans font-semibold text-xs px-5 py-2.5 rounded-full transition-all shadow-resting"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-4 flex justify-center items-center space-x-3">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`p-2.5 rounded-full border border-hairline flex items-center justify-center transition-all ${
                currentPage === 1
                  ? 'text-ink-faint cursor-not-allowed bg-cream/40'
                  : 'text-forest bg-white hover:bg-cream/80 cursor-pointer shadow-resting'
              }`}
              id="pagination-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => handlePageChange(pNum)}
                  className={`w-9 h-9 text-xs font-sans font-semibold rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === pNum
                      ? 'bg-forest text-white shadow-resting'
                      : 'bg-white text-ink-soft hover:bg-cream/60 border border-hairline'
                  }`}
                >
                  {pNum}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`p-2.5 rounded-full border border-hairline flex items-center justify-center transition-all ${
                currentPage === totalPages
                  ? 'text-ink-faint cursor-not-allowed bg-cream/40'
                  : 'text-forest bg-white hover:bg-cream/80 cursor-pointer shadow-resting'
              }`}
              id="pagination-next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter Popup */}
      {isFilterModalOpen && (
        <SearchFilterModal
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}

      {/* Doctor Detail Modal */}
      {selectedDoctorId && (
        <DoctorDetailModal
          doctorId={selectedDoctorId}
          onClose={() => setSelectedDoctorId(null)}
        />
      )}
    </div>
  );
}
