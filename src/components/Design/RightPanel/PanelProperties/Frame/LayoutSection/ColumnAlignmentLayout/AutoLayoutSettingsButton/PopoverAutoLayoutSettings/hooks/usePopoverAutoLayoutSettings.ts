import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// others
import {
  AUTO_SPACING_VALUES,
  CANVAS_STACKING_VALUES,
  INSIDE_STROKE_VALUES,
  LAYOUT_VERSION_VALUES,
  translationNameSpace,
} from '../constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TAlignTextBaseline, TAutoSpacing, TCanvasStacking, TInsideStroke, TLayoutVersion } from '../types';
import { AlignTextBaseline, AutoSpacing, CanvasStacking, InsideStroke, LayoutVersion, NodeType } from 'types/design/enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';
import { TFrameNode } from 'types/design/types';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

// utils
import { commitAlignTextBaselineChange } from './utils/commitAlignTextBaselineChange';
import { commitAutoSpacingChange } from './utils/commitAutoSpacingChange';
import { commitCanvasStackingChange } from './utils/commitCanvasStackingChange';
import { commitInsideStrokeChange } from './utils/commitInsideStrokeChange';
import { commitLayoutVersionChange } from './utils/commitLayoutVersionChange';
import { commitOnFrames } from './utils/commitOnFrames';
import { getAlignTextBaselineToggleButtons } from './utils/getAlignTextBaselineToggleButtons';
import { getSharedValue } from './utils/getSharedValue';
import { isAutoSpacingDisabled } from './utils/isAutoSpacingDisabled';

export type TUsePopoverAutoLayoutSettingsResult = {
  alignTextBaselinePreviewValue: TAlignTextBaseline | null;
  alignTextBaselineToggleButtons: TToggleButton[];
  alignTextBaselineValue: TAlignTextBaseline | undefined;
  autoSpacingDisabled: boolean;
  autoSpacingOptions: TDropdownOption<TAutoSpacing>[];
  autoSpacingPreviewValue: TAutoSpacing | null;
  autoSpacingValue: TAutoSpacing | undefined;
  canvasStackingOptions: TDropdownOption<TCanvasStacking>[];
  canvasStackingPreviewValue: TCanvasStacking | null;
  canvasStackingValue: TCanvasStacking | undefined;
  handleClose: TFunc;
  insideStrokeOptions: TDropdownOption<TInsideStroke>[];
  insideStrokePreviewValue: TInsideStroke | null;
  insideStrokeValue: TInsideStroke | undefined;
  layoutOptions: TDropdownOption<TLayoutVersion>[];
  layoutPreviewValue: TLayoutVersion | null;
  layoutValue: TLayoutVersion | undefined;
  onChangeAlignTextBaseline: TFunc<[string]>;
  onHoverAlignTextBaselineOption: TFunc<[string | null]>;
  onHoverAutoSpacingOption: TFunc<[TAutoSpacing | null]>;
  onHoverCanvasStackingOption: TFunc<[TCanvasStacking | null]>;
  onHoverInsideStrokeOption: TFunc<[TInsideStroke | null]>;
  onHoverLayoutOption: TFunc<[TLayoutVersion | null]>;
  onMouseEnterAlignTextBaseline: TFunc;
  onMouseEnterAutoSpacing: TFunc;
  onMouseEnterCanvasStacking: TFunc;
  onMouseEnterInsideStroke: TFunc;
  onMouseEnterLayout: TFunc;
  onMouseLeaveAlignTextBaseline: TFunc;
  onMouseLeaveAutoSpacing: TFunc;
  onMouseLeaveCanvasStacking: TFunc;
  onMouseLeaveInsideStroke: TFunc;
  onMouseLeaveLayout: TFunc;
  onSelectAutoSpacing: TFunc<[TAutoSpacing]>;
  onSelectCanvasStacking: TFunc<[TCanvasStacking]>;
  onSelectInsideStroke: TFunc<[TInsideStroke]>;
  onSelectLayout: TFunc<[TLayoutVersion]>;
};

export const usePopoverAutoLayoutSettings = (onClose: TFunc): TUsePopoverAutoLayoutSettingsResult => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const frames = useAppSelector(selectSelectedNodes).filter((node): node is TFrameNode => node?.type === NodeType.frame);
  const insideStroke = getSharedValue(frames, (frame) => frame.insideStroke ?? InsideStroke.included, InsideStroke.included);
  const canvasStacking = getSharedValue(frames, (frame) => frame.canvasStacking ?? CanvasStacking.lastOnTop, CanvasStacking.lastOnTop);
  const alignTextBaseline = getSharedValue(frames, (frame) => frame.alignTextBaseline ?? AlignTextBaseline.off, AlignTextBaseline.off);
  const autoSpacing = getSharedValue(frames, (frame) => frame.autoSpacing ?? AutoSpacing.between, AutoSpacing.between);
  const layoutVersion = getSharedValue(frames, (frame) => frame.layoutVersion ?? LayoutVersion.updated, LayoutVersion.updated);
  const autoSpacingDisabled = isAutoSpacingDisabled(frames);
  const [isPreviewingInsideStroke, setIsPreviewingInsideStroke] = useState(false);
  const [hoveredInsideStrokeOption, setHoveredInsideStrokeOption] = useState<TInsideStroke | null>(null);
  const [isPreviewingCanvasStacking, setIsPreviewingCanvasStacking] = useState(false);
  const [hoveredCanvasStackingOption, setHoveredCanvasStackingOption] = useState<TCanvasStacking | null>(null);
  const [isPreviewingAlignTextBaseline, setIsPreviewingAlignTextBaseline] = useState(false);
  const [hoveredAlignTextBaselineOption, setHoveredAlignTextBaselineOption] = useState<TAlignTextBaseline | null>(null);
  const [isPreviewingAutoSpacing, setIsPreviewingAutoSpacing] = useState(false);
  const [hoveredAutoSpacingOption, setHoveredAutoSpacingOption] = useState<TAutoSpacing | null>(null);
  const [isPreviewingLayout, setIsPreviewingLayout] = useState(false);
  const [hoveredLayoutOption, setHoveredLayoutOption] = useState<TLayoutVersion | null>(null);

  const toOptions = <TValue extends string>(group: string, values: readonly TValue[]): TDropdownOption<TValue>[] =>
    values.map((value) => ({ label: t(`${translationNameSpace}.${group}.option.${value}`), value }));

  return {
    alignTextBaselinePreviewValue: hoveredAlignTextBaselineOption ?? (isPreviewingAlignTextBaseline ? (alignTextBaseline ?? null) : null),
    alignTextBaselineToggleButtons: getAlignTextBaselineToggleButtons(t),
    alignTextBaselineValue: alignTextBaseline,
    autoSpacingDisabled,
    autoSpacingOptions: toOptions('autoSpacing', AUTO_SPACING_VALUES),
    autoSpacingPreviewValue: hoveredAutoSpacingOption ?? (isPreviewingAutoSpacing ? (autoSpacing ?? null) : null),
    autoSpacingValue: autoSpacing,
    canvasStackingOptions: toOptions('canvasStacking', CANVAS_STACKING_VALUES),
    canvasStackingPreviewValue: hoveredCanvasStackingOption ?? (isPreviewingCanvasStacking ? (canvasStacking ?? null) : null),
    canvasStackingValue: canvasStacking,
    handleClose: () => onClose(),
    insideStrokeOptions: toOptions('insideStroke', INSIDE_STROKE_VALUES),
    insideStrokePreviewValue: hoveredInsideStrokeOption ?? (isPreviewingInsideStroke ? (insideStroke ?? null) : null),
    insideStrokeValue: insideStroke,
    layoutOptions: toOptions('layout', LAYOUT_VERSION_VALUES),
    layoutPreviewValue: hoveredLayoutOption ?? (isPreviewingLayout ? (layoutVersion ?? null) : null),
    layoutValue: layoutVersion,
    onChangeAlignTextBaseline: (value: string) =>
      commitOnFrames(dispatch, frames, (frame) => commitAlignTextBaselineChange(dispatch, frame, value as TAlignTextBaseline)),
    onHoverAlignTextBaselineOption: (value: string | null) => setHoveredAlignTextBaselineOption(value as TAlignTextBaseline | null),
    onHoverAutoSpacingOption: (value: TAutoSpacing | null) => setHoveredAutoSpacingOption(value),
    onHoverCanvasStackingOption: (value: TCanvasStacking | null) => setHoveredCanvasStackingOption(value),
    onHoverInsideStrokeOption: (value: TInsideStroke | null) => setHoveredInsideStrokeOption(value),
    onHoverLayoutOption: (value: TLayoutVersion | null) => setHoveredLayoutOption(value),
    onMouseEnterAlignTextBaseline: () => setIsPreviewingAlignTextBaseline(true),
    onMouseEnterAutoSpacing: () => setIsPreviewingAutoSpacing(true),
    onMouseEnterCanvasStacking: () => setIsPreviewingCanvasStacking(true),
    onMouseEnterInsideStroke: () => setIsPreviewingInsideStroke(true),
    onMouseEnterLayout: () => setIsPreviewingLayout(true),
    onMouseLeaveAlignTextBaseline: () => setIsPreviewingAlignTextBaseline(false),
    onMouseLeaveAutoSpacing: () => setIsPreviewingAutoSpacing(false),
    onMouseLeaveCanvasStacking: () => setIsPreviewingCanvasStacking(false),
    onMouseLeaveInsideStroke: () => setIsPreviewingInsideStroke(false),
    onMouseLeaveLayout: () => setIsPreviewingLayout(false),
    onSelectAutoSpacing: (value: TAutoSpacing) =>
      commitOnFrames(dispatch, frames, (frame) => commitAutoSpacingChange(dispatch, frame, value)),
    onSelectCanvasStacking: (value: TCanvasStacking) =>
      commitOnFrames(dispatch, frames, (frame) => commitCanvasStackingChange(dispatch, frame, value)),
    onSelectInsideStroke: (value: TInsideStroke) =>
      commitOnFrames(dispatch, frames, (frame) => commitInsideStrokeChange(dispatch, frame, value)),
    onSelectLayout: (value: TLayoutVersion) =>
      commitOnFrames(dispatch, frames, (frame) => commitLayoutVersionChange(dispatch, frame, value)),
  };
};
