// types
import { SizingMode } from 'types/design/enums';

export type TGridTrackViewModel = {
  index: number;
  linkedIndices: number[];
  mode: SizingMode;
  value: number;
};

export type TGridAxisControls = {
  onAdd: TFunc;
  onChangeMode: TFunc<[number, SizingMode]>;
  onChangeValue: TFunc<[number, number]>;
  onDelete: TFunc<[number[]]>;
  onReorder: (sourceIndices: number[], targetIndex: number) => number[] | null;
  revision: unknown;
  tracks: TGridTrackViewModel[];
};
