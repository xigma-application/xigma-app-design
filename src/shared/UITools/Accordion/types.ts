import { ReactNode } from 'react';

export type TAccordionItem = {
  content: ReactNode;
  defaultExpanded?: boolean;
  label: ReactNode;
};
