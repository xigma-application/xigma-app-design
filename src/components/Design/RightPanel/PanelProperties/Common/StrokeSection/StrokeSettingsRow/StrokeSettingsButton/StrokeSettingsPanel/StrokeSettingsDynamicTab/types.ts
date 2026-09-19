import { FocusEvent } from 'react';

// store
import { updateNode } from 'store/design/slice';

import { STROKE_DYNAMIC_FIELDS } from './constants';

export type TStrokeDynamicField = (typeof STROKE_DYNAMIC_FIELDS)[number];

export type TStrokeDynamicChanges = Parameters<typeof updateNode>[0]['changes'];

export type TCommitStrokeDynamicChanges = TFunc<[TStrokeDynamicChanges]>;

export type TUseStrokeSettingsDynamicTabResult = {
  onBlur: (field: TStrokeDynamicField) => TFunc<[FocusEvent<HTMLInputElement>]>;
  values: Record<TStrokeDynamicField, number>;
};
