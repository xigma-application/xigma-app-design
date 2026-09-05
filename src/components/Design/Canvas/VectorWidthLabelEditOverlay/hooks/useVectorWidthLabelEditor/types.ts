// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

export type TVectorWidthLabelEdit = {
  badgeHeight: number;
  badgeWidth: number;
  center: TPoint;
  nodeId: string;
  pointId: string;
  value: number;
};

export type TVectorWidthLabelEditor = {
  cancel: TFunc;
  commit: TFunc<[string]>;
  edit: TVectorWidthLabelEdit | null;
  viewport: TViewport;
};
