// types
import { TGradientPaint, TPaintProperty, TSolidPaint } from 'types/design/paint/types';

export type TSelectionColorOccurrence = { index: number; nodeId: string; property: TPaintProperty };

export type TSelectionColorGroup = {
  key: string;
  occurrences: TSelectionColorOccurrence[];
  paint: TSolidPaint | TGradientPaint;
  signature: string;
};
