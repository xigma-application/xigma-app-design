// types
import { TDraftRect } from 'types/canvas';

export type TAutoLayoutGapAxis = 'x' | 'y';

export type TAutoLayoutGapHandles = {
  horizontal: TDraftRect[];
  vertical: TDraftRect[];
};
