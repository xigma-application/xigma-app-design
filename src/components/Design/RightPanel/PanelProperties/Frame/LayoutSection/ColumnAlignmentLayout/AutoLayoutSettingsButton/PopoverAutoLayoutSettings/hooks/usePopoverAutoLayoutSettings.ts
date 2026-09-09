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

// types
import { TAlignTextBaseline, TAutoSpacing, TCanvasStacking, TInsideStroke, TLayoutVersion } from '../types';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

// utils
import { getAlignTextBaselineToggleButtons } from './utils/getAlignTextBaselineToggleButtons';

export type TUsePopoverAutoLayoutSettingsResult = {
  alignTextBaselinePreviewValue: TAlignTextBaseline | null;
  alignTextBaselineToggleButtons: TToggleButton[];
  alignTextBaselineValue: TAlignTextBaseline;
  autoSpacingOptions: TDropdownOption<TAutoSpacing>[];
  autoSpacingPreviewValue: TAutoSpacing | null;
  autoSpacingValue: TAutoSpacing;
  canvasStackingOptions: TDropdownOption<TCanvasStacking>[];
  canvasStackingPreviewValue: TCanvasStacking | null;
  canvasStackingValue: TCanvasStacking;
  handleClose: TFunc;
  insideStrokeOptions: TDropdownOption<TInsideStroke>[];
  insideStrokePreviewValue: TInsideStroke | null;
  insideStrokeValue: TInsideStroke;
  layoutOptions: TDropdownOption<TLayoutVersion>[];
  layoutPreviewValue: TLayoutVersion | null;
  layoutValue: TLayoutVersion;
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
  const [insideStroke, setInsideStroke] = useState<TInsideStroke>('included');
  const [canvasStacking, setCanvasStacking] = useState<TCanvasStacking>('lastOnTop');
  const [alignTextBaseline, setAlignTextBaseline] = useState<TAlignTextBaseline>('off');
  const [autoSpacing, setAutoSpacing] = useState<TAutoSpacing>('between');
  const [layoutVersion, setLayoutVersion] = useState<TLayoutVersion>('updated');
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
    alignTextBaselinePreviewValue: hoveredAlignTextBaselineOption ?? (isPreviewingAlignTextBaseline ? alignTextBaseline : null),
    alignTextBaselineToggleButtons: getAlignTextBaselineToggleButtons(t),
    alignTextBaselineValue: alignTextBaseline,
    autoSpacingOptions: toOptions('autoSpacing', AUTO_SPACING_VALUES),
    autoSpacingPreviewValue: hoveredAutoSpacingOption ?? (isPreviewingAutoSpacing ? autoSpacing : null),
    autoSpacingValue: autoSpacing,
    canvasStackingOptions: toOptions('canvasStacking', CANVAS_STACKING_VALUES),
    canvasStackingPreviewValue: hoveredCanvasStackingOption ?? (isPreviewingCanvasStacking ? canvasStacking : null),
    canvasStackingValue: canvasStacking,
    handleClose: () => onClose(),
    insideStrokeOptions: toOptions('insideStroke', INSIDE_STROKE_VALUES),
    insideStrokePreviewValue: hoveredInsideStrokeOption ?? (isPreviewingInsideStroke ? insideStroke : null),
    insideStrokeValue: insideStroke,
    layoutOptions: toOptions('layout', LAYOUT_VERSION_VALUES),
    layoutPreviewValue: hoveredLayoutOption ?? (isPreviewingLayout ? layoutVersion : null),
    layoutValue: layoutVersion,
    onChangeAlignTextBaseline: (value: string) => setAlignTextBaseline(value as TAlignTextBaseline),
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
    onSelectAutoSpacing: (value: TAutoSpacing) => setAutoSpacing(value),
    onSelectCanvasStacking: (value: TCanvasStacking) => setCanvasStacking(value),
    onSelectInsideStroke: (value: TInsideStroke) => setInsideStroke(value),
    onSelectLayout: (value: TLayoutVersion) => setLayoutVersion(value),
  };
};
