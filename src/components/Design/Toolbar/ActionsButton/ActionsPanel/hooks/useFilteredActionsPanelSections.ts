import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// others
import { ITEMS, SECTION_ORDER } from '../constants';

// types
import { TActionsPanelItem, TActionsPanelSection } from '../types';

export type TActionsPanelSectionGroup = { items: TActionsPanelItem[]; section: TActionsPanelSection };

export const useFilteredActionsPanelSections = (query: string): TActionsPanelSectionGroup[] => {
  const { t } = useTranslation();

  return useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchingItems = ITEMS.filter((item) => t(item.labelKey).toLowerCase().includes(normalizedQuery));

    return SECTION_ORDER.map((section) => ({ items: matchingItems.filter((item) => item.section === section), section })).filter(
      (group) => group.items.length > 0,
    );
  }, [query, t]);
};
