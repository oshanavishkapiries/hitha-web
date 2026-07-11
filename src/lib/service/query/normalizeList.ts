// Backend list endpoints sometimes return a bare array and sometimes a paginated
// { content: [...] } page object; callers just want the items either way.
export const normalizeList = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && Array.isArray(data.content)) {
    return data.content;
  }
  return [];
};
