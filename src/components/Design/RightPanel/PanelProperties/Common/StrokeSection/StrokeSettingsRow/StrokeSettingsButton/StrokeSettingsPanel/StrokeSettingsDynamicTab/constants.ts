// types
import { TIconProps } from '@xigma/components';

// others
import {
  STROKE_DYNAMIC_FREQUENCY_MAX,
  STROKE_DYNAMIC_FREQUENCY_MIN,
  STROKE_DYNAMIC_SMOOTHEN_MAX,
  STROKE_DYNAMIC_SMOOTHEN_MIN,
  STROKE_DYNAMIC_WIGGLE_MIN,
} from 'constant/strokeDynamic';

export const STROKE_DYNAMIC_FIELDS = ['frequency', 'wiggle', 'smoothen'] as const;

export const STROKE_DYNAMIC_ICONS: Record<(typeof STROKE_DYNAMIC_FIELDS)[number], TIconProps['name']> = {
  frequency: 'Frequency',
  smoothen: 'Smoothen',
  wiggle: 'Wiggle',
};

export const STROKE_DYNAMIC_LIMITS = {
  frequency: { max: STROKE_DYNAMIC_FREQUENCY_MAX, min: STROKE_DYNAMIC_FREQUENCY_MIN, nodeKey: 'strokeDynamicFrequency' },
  smoothen: { max: STROKE_DYNAMIC_SMOOTHEN_MAX, min: STROKE_DYNAMIC_SMOOTHEN_MIN, nodeKey: 'strokeDynamicSmoothen' },
  wiggle: { max: undefined, min: STROKE_DYNAMIC_WIGGLE_MIN, nodeKey: 'strokeDynamicWiggle' },
} as const;
