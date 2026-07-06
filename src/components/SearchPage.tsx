import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_DOCTORS } from '../data';
import { Doctor, FilterParams, Specialization } from '../types';
import { getQueryParams, updateUrlQueryParams, navigateTo } from '../utils/navigation';
import DoctorDetailModal from './DoctorDetailModal';
import HithaDatePicker from './HithaDatePicker';
import { Filter, RotateCcw, Languages, Search, Users, CircleDollarSign, ChevronLeft, ChevronRight, Star, ShieldAlert, Calendar } from 'lucide-react';

export default function SearchPage() {
  const [filters, setFilters] = useState<FilterParams>({
    name: '',
    category: '',
    language: '',
    gender: '',
    minPrice: undefined,
    maxPrice: undefined,
    date: '',
    page: 1,
  });
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Synchronize filters on mount & back/forward browser navigation
  useEffect(() => {
    setFilters(getQueryParams());

    const handlePopState = () => {
      setFilters(getQueryParams());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const specializations: Specialization[] = [
    'Counselor',
    'Clinical Counselor',
    'Psychologist',
    'Clinical Psychologist',
    'Medical Officer (Psychiatry Diploma)',
    'Consultant Psychiatrist',
  ];

  const languages = ['Sinhala', 'Tamil', 'English'];
  const genders = ['Male', 'Female'];

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
      date: '',
      page: 1,
    };
    setFilters(cleared);
    updateUrlQueryParams(cleared);
  };

  const handlePageChange = (newPage: number) => {
    const nextFilters = { ...filters, page: newPage };
    setFilters(nextFilters);
    updateUrlQueryParams(nextFilters);
    // Scroll to top of directory
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Perform full client-side filtering based on criteria
  const filteredDoctors = useMemo(() => {
    return MOCK_DOCTORS.filter((doc) => {
      // Filter by name
      if (filters.name) {
        const docName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
        if (!docName.includes(filters.name.toLowerCase())) {
          return false;
        }
      }
      // Filter by category/specialization (Broad-matching support)
      if (filters.category) {
        const catLower = filters.category.toLowerCase();
        const docSpecLower = doc.specialization.toLowerCase();
        
        if (catLower === 'psychiatry' || catLower === 'consultant psychiatrist') {
          if (!docSpecLower.includes('psychiatri') && !docSpecLower.includes('psychiatry')) {
            return false;
          }
        } else if (catLower === 'psychology' || catLower === 'clinical psychologist' || catLower === 'psychologist') {
          if (!docSpecLower.includes('psycholog')) {
            return false;
          }
        } else if (catLower === 'counseling' || catLower === 'clinical counselor' || catLower === 'counselor') {
          if (!docSpecLower.includes('counsel')) {
            return false;
          }
        } else if (docSpecLower !== catLower) {
          return false;
        }
      }
      // Filter by language
      if (filters.language && !doc.languages.includes(filters.language)) {
        return false;
      }
      // Filter by gender
      if (filters.gender && doc.gender !== filters.gender) {
        return false;
      }
      // Filter by price
      if (filters.minPrice !== undefined && doc.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && doc.price > filters.maxPrice) {
        return false;
      }
      return true;
    });
  }, [filters]);

  // Paginate results
  const pageSize = filters.size || 6;
  const currentPage = filters.page || 1;
  const totalResults = filteredDoctors.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;

  const paginatedDoctors = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredDoctors.slice(startIdx, startIdx + pageSize);
  }, [filteredDoctors, currentPage, pageSize]);

  return (
    <div className="bg-cream min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Breadcrumb / Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans font-bold text-moss uppercase tracking-wider">
              <button onClick={() => navigateTo('/')} className="hover:text-forest">Hitha</button>
              <span>/</span>
              <span className="text-forest font-semibold">Specialist Directory</span>
            </div>
            <h1 className="font-display font-bold text-3xl text-forest mt-2 tracking-tight">
              Anonymous Care Registry
            </h1>
            <p className="text-xs text-ink-soft mt-1">
              Select any clinical practitioner to view specialized qualifications, slot timings, and patient reviews.
            </p>
          </div>

          <div className="bg-[#C9DFC7]/30 border border-sprout/60 rounded-sub p-3 flex items-center space-x-2.5 max-w-sm self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-forest block animate-pulse" />
            <span className="text-xs font-sans font-semibold text-forest">
              End-to-End Cryptographic Escrow Active
            </span>
          </div>
        </div>

        {/* Search & Filter Panel */}
        <div className="bg-white rounded-card p-6 border border-hairline shadow-resting" id="filter-panel-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2 text-forest font-display font-semibold text-base">
              <Filter className="w-4 h-4 text-moss" />
              <span>Refine Directory Search</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 text-xs font-sans font-bold text-ink-soft hover:text-clay transition-colors focus:outline-none cursor-pointer"
              id="reset-filters-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint w-3.5 h-3.5" />
                <input
                  type="text"
                  value={filters.name || ''}
                  onChange={(e) => handleFilterChange({ name: e.target.value })}
                  placeholder="e.g. Lasantha"
                  className="w-full bg-cream/30 hover:bg-cream/60 focus:bg-white text-xs text-ink rounded-sub pl-9 pr-3 py-2.5 border border-hairline focus:border-moss outline-none transition-all"
                  id="filter-name"
                />
              </div>
            </div>

            {/* Specialization Category */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange({ category: e.target.value as Specialization | '' })}
                className="w-full bg-cream/30 hover:bg-cream/60 focus:bg-white text-xs text-ink rounded-sub px-3 py-2.5 border border-hairline focus:border-moss outline-none transition-all cursor-pointer"
                id="filter-category"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Language</label>
              <div className="relative">
                <select
                  value={filters.language || ''}
                  onChange={(e) => handleFilterChange({ language: e.target.value })}
                  className="w-full bg-cream/30 hover:bg-cream/60 focus:bg-white text-xs text-ink rounded-sub px-3 py-2.5 border border-hairline focus:border-moss outline-none transition-all cursor-pointer"
                  id="filter-language"
                >
                  <option value="">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Gender</label>
              <select
                value={filters.gender || ''}
                onChange={(e) => handleFilterChange({ gender: e.target.value })}
                className="w-full bg-cream/30 hover:bg-cream/60 focus:bg-white text-xs text-ink rounded-sub px-3 py-2.5 border border-hairline focus:border-moss outline-none transition-all cursor-pointer"
                id="filter-gender"
              >
                <option value="">All Genders</option>
                {genders.map((gen) => (
                  <option key={gen} value={gen}>
                    {gen}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price LKR */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Min Price (LKR)</label>
              <input
                type="number"
                value={filters.minPrice === undefined ? '' : filters.minPrice}
                onChange={(e) =>
                  handleFilterChange({ minPrice: e.target.value === '' ? undefined : Number(e.target.value) })
                }
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
                onChange={(e) =>
                  handleFilterChange({ maxPrice: e.target.value === '' ? undefined : Number(e.target.value) })
                }
                placeholder="10000"
                min="0"
                className="w-full bg-cream/30 hover:bg-cream/60 focus:bg-white text-xs text-ink rounded-sub px-3 py-2.5 border border-hairline focus:border-moss outline-none transition-all font-mono"
                id="filter-max-price"
              />
            </div>

            {/* Premium Custom Date Selection */}
            <div className="space-y-1.5 relative">
              <label className="block text-[11px] font-sans font-bold text-ink-soft uppercase tracking-wider">Available Date</label>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="w-full bg-cream/30 hover:bg-cream/60 focus:bg-white text-xs text-ink rounded-sub px-3 py-2.5 border border-hairline focus:border-moss outline-none transition-all flex items-center justify-between cursor-pointer text-left"
                id="filter-date-trigger"
              >
                <span className="truncate">
                  {filters.date
                    ? new Date(filters.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Select Date'}
                </span>
                <Calendar className="w-3.5 h-3.5 text-moss shrink-0 ml-1.5" />
              </button>

              {isDatePickerOpen && (
                <HithaDatePicker
                  selectedDate={filters.date || ''}
                  onDateChange={(selectedDateStr) => {
                    handleFilterChange({ date: selectedDateStr });
                    setIsDatePickerOpen(false);
                  }}
                  onClose={() => setIsDatePickerOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Directory Results */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <p className="text-xs text-ink-soft font-medium">
              Showing <span className="text-forest font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="text-forest font-semibold">
                {Math.min(currentPage * pageSize, totalResults)}
              </span>{' '}
              of <span className="text-forest font-bold">{totalResults}</span> certified therapists
            </p>
          </div>

          {paginatedDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDoctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className="bg-white rounded-card p-6 border border-hairline shadow-resting hover:shadow-elevated transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                  id={`doctor-card-${doc.id}`}
                >
                  <div className="space-y-4">
                    {/* Doctor Header card */}
                    <div className="flex items-start space-x-4">
                      <img
                        src={doc.profilePicture}
                        alt={`${doc.firstName} ${doc.lastName}`}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full object-cover border-2 border-sprout"
                      />
                      <div className="space-y-1 flex-1">
                        <span className="inline-block text-[10px] font-sans font-bold text-moss uppercase tracking-wider bg-sprout/25 px-2 py-0.5 rounded-full">
                          {doc.specialization}
                        </span>
                        <h3 className="font-display font-semibold text-lg text-forest leading-tight">
                          Dr. {doc.firstName} {doc.lastName}
                        </h3>
                        <div className="flex items-center space-x-1.5 text-xs text-saffron">
                          <Star className="w-3.5 h-3.5 fill-saffron text-saffron" />
                          <span className="font-sans font-bold text-ink">{doc.rating}</span>
                          <span className="text-ink-faint">({doc.reviews.length} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {/* Muted Bio snippet */}
                    <p className="text-xs text-ink-soft line-clamp-3 leading-relaxed">
                      {doc.bio}
                    </p>
                  </div>

                  {/* Languages, price starting and button */}
                  <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between">
                    <div className="flex flex-wrap gap-1 max-w-[60%]">
                      {doc.languages.map((lang) => (
                        <span
                          key={lang}
                          className="text-[10px] font-sans font-semibold text-forest bg-cream px-2 py-0.5 rounded-full border border-hairline"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] font-sans font-semibold text-ink-faint">Starting Price</span>
                      <span className="text-xs font-sans text-forest font-medium">
                        from <span className="font-mono text-sm font-bold">LKR {doc.price.toLocaleString()}</span>
                      </span>
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
                  No clinicians matched your precise search parameters. Try lowering minimum pricing constraints or searching for "All Specializations" to see more Sri Lankan consultants.
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
            <div className="pt-8 flex justify-center items-center space-x-3">
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
      </div>

      {/* Render Doctor Detail Modal */}
      {selectedDoctor && (
        <DoctorDetailModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
        />
      )}
    </div>
  );
}
