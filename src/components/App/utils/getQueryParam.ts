export const getQueryParam = (name: string): string | null => new URLSearchParams(window.location.search).get(name);
