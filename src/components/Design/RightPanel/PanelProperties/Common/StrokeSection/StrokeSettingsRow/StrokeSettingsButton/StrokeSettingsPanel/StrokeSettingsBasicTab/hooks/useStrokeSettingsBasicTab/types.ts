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

export type TSharedStrokeSettings = {
  dash: number | undefined;
  dashCap: StrokeDashCap | undefined;
  dashes: number[] | undefined;
  gap: number | undefined;
  hasDashes: boolean;
  isCustom: boolean;
  isDashed: boolean;
  isMiter: boolean;
  isWidthProfileDisabled: boolean;
  join: StrokeJoin | undefined;
  miterAngle: number | undefined;
  style: StrokeStyle | undefined;
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

export type TUseStrokeSettingsBasicTabResult = TSharedStrokeSettings & {
  hasJoin: boolean;
  onDashBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDashCapSelect: TFunc<[string]>;
  onDashScrub: TFunc<[number]>;
  onDashStep: TFunc<[string]>;
  onDashesBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDashesScrub: TFunc<[number]>;
  onDashesStep: TFunc<[string]>;
  onGapBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onGapScrub: TFunc<[number]>;
  onGapStep: TFunc<[string]>;
  onJoinSelect: TFunc<[string]>;
  onMiterAngleBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onMiterAngleDragEnd: TFunc;
  onMiterAngleDragStart: TFunc;
  onMiterAngleStep: TFunc<[string]>;
  onMiterAngleScrub: TFunc<[number]>;
  onScrubDragEnd: TFunc;
  onScrubDragStart: TFunc;
  onStyleSelect: TFunc<[StrokeStyle]>;
  scrubValues: TStrokeSettingsValues;
};
