// types
import { TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';
import { TViewport } from 'types/design/types';

export type TGridTrackValueLabelEditor = {
  cancel: TFunc;
  commit: TFunc<[string]>;
  edit: TGridTrackValueEditTarget | null;
  liveChange: TFunc<[string]>;
  viewport: TViewport;
};
