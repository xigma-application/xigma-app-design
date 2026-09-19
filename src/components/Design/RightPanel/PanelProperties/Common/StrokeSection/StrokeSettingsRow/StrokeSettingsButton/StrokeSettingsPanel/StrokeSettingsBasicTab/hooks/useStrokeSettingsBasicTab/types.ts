import { FocusEvent } from 'react';

// store
import { updateNode } from 'store/design/slice';

// types
import { StrokeAlign, StrokeDashCap, StrokeJoin, StrokeStyle } from 'types/design/enums';

export type TStrokeChanges = Parameters<typeof updateNode>[0]['changes'];

export type TCommitStrokeChanges = TFunc<[TStrokeChanges]>;

export type TStrokeSettingsValues = {
  dash: number;
  dashCap: StrokeDashCap;
  dashes: number[];
  gap: number;
  hasDashes: boolean;
  isCustom: boolean;
  isDashed: boolean;
  isMiter: boolean;
  join: StrokeJoin;
  miterAngle: number;
  style: StrokeStyle;
};

export type TStrokeSettingsValuesSource = {
  strokeAlign?: StrokeAlign;
  strokeDash?: number;
  strokeDashCap?: StrokeDashCap;
  strokeDashes?: number[];
  strokeGap?: number;
  strokeJoin?: StrokeJoin;
  strokeMiterAngle?: number;
  strokeStyle?: StrokeStyle;
};

export type TUseStrokeSettingsBasicTabResult = TStrokeSettingsValues & {
  onDashBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDashCapSelect: TFunc<[string]>;
  onDashesBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onGapBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onJoinSelect: TFunc<[string]>;
  onMiterAngleBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onMiterAngleDragEnd: TFunc;
  onMiterAngleDragStart: TFunc;
  onMiterAngleScrub: TFunc<[number]>;
  onStyleSelect: TFunc<[StrokeStyle]>;
};
