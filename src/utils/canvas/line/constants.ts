// types
import { TLineNode, TVectorNode } from 'types/design/types';

export const LINE_VECTOR_STROKE_SETTING_KEYS: (keyof TLineNode & keyof TVectorNode)[] = [
  'strokeBrush',
  'strokeBrushAngularJitter',
  'strokeBrushDirection',
  'strokeBrushGap',
  'strokeBrushRotation',
  'strokeBrushSizeJitter',
  'strokeBrushWiggle',
  'strokeDash',
  'strokeDashCap',
  'strokeDashes',
  'strokeDynamicFrequency',
  'strokeDynamicSmoothen',
  'strokeDynamicWiggle',
  'strokeGap',
  'strokeMode',
  'strokeProfile',
  'strokeProfileFlipped',
  'strokeStyle',
];

export const LINE_OFFSET_FALLBACK_STROKE = '#000000';
