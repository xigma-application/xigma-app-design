import { FocusEvent } from 'react';

// store
import { updateNode } from 'store/design/slice';

// types
import { StrokeBrushDirection } from 'types/design/enums';
import { TStrokeScatterBrushField } from '../../constants';

export type TStrokeBrushChanges = Parameters<typeof updateNode>[0]['changes'];

export type TApplyStrokeBrushChanges = TFunc<[TStrokeBrushChanges]>;

export type TOriginalStrokeBrush = { brush: string; id: string };

export type TUseStrokeSettingsBrushTabResult = {
  brush: string | undefined;
  direction: StrokeBrushDirection | undefined;
  isDirectionBrush: boolean;
  isScatterBrush: boolean;
  onBrushCommit: TFunc<[string]>;
  onBrushPreview: TFunc<[string]>;
  onBrushRevert: TFunc;
  onDirectionChange: TFunc<[string]>;
  onScatterBlur: (field: TStrokeScatterBrushField) => TFunc<[FocusEvent<HTMLInputElement>]>;
  scatterValues: Record<TStrokeScatterBrushField, number | undefined>;
};
