export type TGridTrackAxis = 'column' | 'row';

export type TGridTrackChild = {
  anchorIndex: number | undefined;
  id: string;
  span: number;
};

export type TGridTrackChildDeleteUpdate = {
  anchorIndex: number | undefined;
  id: string;
  span: number | undefined;
};

export type TGridTrackReorderChildUpdate = {
  anchorIndex: number;
  id: string;
};

export type TGridTrackReorderResult = {
  ok: boolean;
  updates: TGridTrackReorderChildUpdate[];
};
