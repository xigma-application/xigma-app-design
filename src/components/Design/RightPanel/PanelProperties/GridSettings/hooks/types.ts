// types
import { SizingMode } from 'types/design/enums';

export type TGridTrackViewModel = {
  index: number;
  linkedIndices: number[];
  mode: SizingMode;
  resolvedSize: number;
  value: number;
};

export type TGridAxisControls = {
  onAdd: TFunc;
  onChangeMode: (indices: number[], mode: SizingMode, value?: number) => void;
  onChangeValue: (indices: number[], triggerIndex: number, value: number) => void;
  onDelete: TFunc<[number[]]>;
  onReorder: (sourceIndices: number[], targetIndex: number) => number[] | null;
  revision: unknown;
  tracks: TGridTrackViewModel[];
};
