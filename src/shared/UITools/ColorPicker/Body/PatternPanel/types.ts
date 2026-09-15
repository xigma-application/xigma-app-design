// types
import { TPatternDirection, TPatternTileType } from 'types/design/paint/types';

export type TPatternPanelState = {
  alignmentIndex: number;
  direction: TPatternDirection;
  offsetX: number;
  offsetY: number;
  scale: number;
  spacingX: number;
  spacingY: number;
  tileType: TPatternTileType;
};

export type TInitialPattern = TPatternPanelState;
export type TPatternPanelChange = TPatternPanelState;
