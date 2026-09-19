// types
import { TIconProps } from '@xigma/components';

export const STROKE_DYNAMIC_FIELDS = ['frequency', 'wiggle', 'smoothen'] as const;

export type TStrokeDynamicField = (typeof STROKE_DYNAMIC_FIELDS)[number];

export const STROKE_DYNAMIC_ICONS: Record<TStrokeDynamicField, TIconProps['name']> = {
  frequency: 'Frequency',
  smoothen: 'Smoothen',
  wiggle: 'Wiggle',
};

export const DEFAULT_STROKE_DYNAMIC_VALUES: Record<TStrokeDynamicField, string> = {
  frequency: '75%',
  smoothen: '50%',
  wiggle: '30%',
};
