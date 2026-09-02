// types
import { TPoint } from 'types/canvas';

export type TSelectedGuide = {
  frameId: string | null;
  id: string;
  worldPoint: TPoint;
};

export type TUseGuideTool = {
  removeSelectedGuide: () => void;
  selectedGuide: TSelectedGuide | null;
};
