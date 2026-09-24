// utils
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';

type TParent = Parameters<typeof getNodeAbsoluteFromParentPosition>[1];

export type TPositionEntry = {
  disabledX: boolean;
  disabledY: boolean;
  id: string;
  parent: TParent | undefined;
  x: number;
  y: number;
};

export type TPositionScrubStart = { entries: TPositionEntry[]; x: number; y: number };
