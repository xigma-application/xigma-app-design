// types
import { TPatternTileType } from 'types/design/paint/types';

export type TPatternPanelState = {
  alignmentIndex: number;
  scale: number;
  spacingX: number;
  spacingY: number;
  tileType: TPatternTileType;
};

export type TInitialPattern = TPatternPanelState;
export type TPatternPanelChange = TPatternPanelState;
