// types
import { TAppearanceNode } from '../AppearanceSection/types';
import { TGradientPaint, TPaint, TPaintProperty, TSolidPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

export type TSelectionColorNode = TAppearanceNode | TVectorNode;

export type TSelectionColorOccurrence = { faceKey?: string; index: number; nodeId: string; property: TPaintProperty };

export type TSelectionColorPaintSource = { faceKey?: string; paints: TPaint[]; property: TPaintProperty };

export type TSelectionColorGroup = {
  key: string;
  occurrences: TSelectionColorOccurrence[];
  paint: TSolidPaint | TGradientPaint;
  signature: string;
};
