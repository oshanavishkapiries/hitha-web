import { FilterParams, Specialization } from '../types';

export function getQueryParams(): FilterParams {
  if (typeof window === 'undefined') {
    return {
      name: '',
      category: '',
      language: '',
      gender: '',
      minPrice: undefined,
      maxPrice: undefined,
      date: '',
      page: 1,
    };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get('name') || '',
    category: (params.get('category') as Specialization) || '',
    language: params.get('language') || '',
    gender: params.get('gender') || '',
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    date: params.get('date') || '',
    page: params.get('page') ? Number(params.get('page')) : 1,
    size: params.get('size') ? Number(params.get('size')) : 6,
  };
}

export function updateUrlQueryParams(params: Partial<FilterParams>) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, String(value));
    }
  });

  url.search = searchParams.toString();
  window.history.pushState({}, '', url.toString());
}

export function navigateTo(path: string, params?: Partial<FilterParams>) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.origin + path);
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    url.search = searchParams.toString();
  }
  window.history.pushState({}, '', url.toString());
  // Dispatch a custom event to notify listeners of path changes
  window.dispatchEvent(new Event('popstate'));
}

