import { ReactNode } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

export type TAccordionIconRotation = { collapsed: number; expanded: number };

export type TAccordionItem = {
  className?: string;
  content: ReactNode;
  defaultExpanded?: boolean;
  icon?: TIconProps['name'];
  iconRotation?: TAccordionIconRotation;
  iconSize?: number;
  label: ReactNode;
};
