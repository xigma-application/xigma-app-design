import { FocusEvent } from 'react';

// store
import { updateNode } from 'store/design/slice';

// types
import { StrokeBrushDirection } from 'types/design/enums';
import { TStrokeScatterBrushField } from '../../constants';

export type TStrokeBrushChanges = Parameters<typeof updateNode>[0]['changes'];

export type TApplyStrokeBrushChanges = TFunc<[TStrokeBrushChanges]>;

export type TUseStrokeSettingsBrushTabResult = {
  brush: string;
  direction: StrokeBrushDirection;
  onBrushCommit: TFunc<[string, string]>;
  onBrushSelect: TFunc<[string]>;
  onDirectionChange: TFunc<[string]>;
  onScatterBlur: (field: TStrokeScatterBrushField) => TFunc<[FocusEvent<HTMLInputElement>]>;
  scatterValues: Record<TStrokeScatterBrushField, number>;
};
