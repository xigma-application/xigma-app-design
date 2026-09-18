// types
import { StrokeSides } from 'types/design/enums';

export type TStrokeSide = 'bottom' | 'left' | 'right' | 'top';

export type TStrokeSideWidths = Record<TStrokeSide, number>;

export type TStrokeSideSource = {
  strokeBottomWidth?: number;
  strokeLeftWidth?: number;
  strokeRightWidth?: number;
  strokeSides?: StrokeSides;
  strokeTopWidth?: number;
  strokeWidth?: number;
};

export type TStrokeSidesChange = TStrokeSideSource;
