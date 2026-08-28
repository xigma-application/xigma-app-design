// others
import { DEFAULT_PAGE_NAME } from '../constants';

// types
import { TDesignPage } from '../types';

const PAGE_NAME_PATTERN = /^Page (\d+)$/;

export const getNextPageName = (pages: Record<string, TDesignPage>): string => {
  const numbers = Object.values(pages)
    .map((page) => PAGE_NAME_PATTERN.exec(page.name))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]));

  if (numbers.length === 0) {
    return DEFAULT_PAGE_NAME;
  }

  return `Page ${Math.max(...numbers) + 1}`;
};
