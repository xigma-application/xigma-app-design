import { FC } from 'react';

// components
import PopoverAutoLayoutSettingsAlignTextBaseline from './PopoverAutoLayoutSettingsAlignTextBaseline';
import PopoverAutoLayoutSettingsAutoSpacing from './PopoverAutoLayoutSettingsAutoSpacing';
import PopoverAutoLayoutSettingsCanvasStacking from './PopoverAutoLayoutSettingsCanvasStacking';
import PopoverAutoLayoutSettingsHeader from './PopoverAutoLayoutSettingsHeader/PopoverAutoLayoutSettingsHeader';
import PopoverAutoLayoutSettingsInsideStroke from './PopoverAutoLayoutSettingsInsideStroke';
import PopoverAutoLayoutSettingsLayout from './PopoverAutoLayoutSettingsLayout';
import PopoverAutoLayoutSettingsPreview from './PopoverAutoLayoutSettingsPreview/PopoverAutoLayoutSettingsPreview';

// hooks
import { usePopoverAutoLayoutSettings } from './hooks/usePopoverAutoLayoutSettings';

// styles
import styles from './popover-auto-layout-settings.module.scss';

// types
import { LayoutMode } from 'types/design/enums';

export type TPopoverAutoLayoutSettingsProps = {
  layoutMode?: LayoutMode;
  onClose: TFunc;
};

export const PopoverAutoLayoutSettings: FC<TPopoverAutoLayoutSettingsProps> = ({ layoutMode, onClose }) => {
  const isGridLayout = layoutMode === LayoutMode.grid;
  const isHorizontalLayout = layoutMode === LayoutMode.horizontal;
  const {
    alignTextBaselinePreviewValue,
    alignTextBaselineToggleButtons,
    alignTextBaselineValue,
    autoSpacingOptions,
    autoSpacingPreviewValue,
    autoSpacingValue,
    canvasStackingOptions,
    canvasStackingPreviewValue,
    canvasStackingValue,
    handleClose,
    insideStrokeOptions,
    insideStrokePreviewValue,
    insideStrokeValue,
    layoutOptions,
    layoutPreviewValue,
    layoutValue,
    onChangeAlignTextBaseline,
    onHoverAlignTextBaselineOption,
    onHoverAutoSpacingOption,
    onHoverCanvasStackingOption,
    onHoverInsideStrokeOption,
    onHoverLayoutOption,
    onMouseEnterAlignTextBaseline,
    onMouseEnterAutoSpacing,
    onMouseEnterCanvasStacking,
    onMouseEnterInsideStroke,
    onMouseEnterLayout,
    onMouseLeaveAlignTextBaseline,
    onMouseLeaveAutoSpacing,
    onMouseLeaveCanvasStacking,
    onMouseLeaveInsideStroke,
    onMouseLeaveLayout,
    onSelectAutoSpacing,
    onSelectCanvasStacking,
    onSelectInsideStroke,
    onSelectLayout,
  } = usePopoverAutoLayoutSettings(onClose);

  return (
    <div className={styles.PopoverAutoLayoutSettings}>
      <PopoverAutoLayoutSettingsHeader onClose={handleClose} />
      <PopoverAutoLayoutSettingsPreview
        alignTextBaseline={alignTextBaselinePreviewValue}
        autoSpacing={autoSpacingPreviewValue}
        canvasStacking={canvasStackingPreviewValue}
        insideStroke={insideStrokePreviewValue}
        layout={layoutPreviewValue}
      />
      <div className={styles.PopoverAutoLayoutSettings__rows}>
        <PopoverAutoLayoutSettingsInsideStroke
          onHoverOption={onHoverInsideStrokeOption}
          onMouseEnter={onMouseEnterInsideStroke}
          onMouseLeave={onMouseLeaveInsideStroke}
          onSelect={onSelectInsideStroke}
          options={insideStrokeOptions}
          value={insideStrokeValue}
        />
        {!isGridLayout && (
          <PopoverAutoLayoutSettingsCanvasStacking
            onHoverOption={onHoverCanvasStackingOption}
            onMouseEnter={onMouseEnterCanvasStacking}
            onMouseLeave={onMouseLeaveCanvasStacking}
            onSelect={onSelectCanvasStacking}
            options={canvasStackingOptions}
            value={canvasStackingValue}
          />
        )}
        {isHorizontalLayout && (
          <PopoverAutoLayoutSettingsAlignTextBaseline
            onChange={onChangeAlignTextBaseline}
            onHoverOption={onHoverAlignTextBaselineOption}
            onMouseEnter={onMouseEnterAlignTextBaseline}
            onMouseLeave={onMouseLeaveAlignTextBaseline}
            toggleButtons={alignTextBaselineToggleButtons}
            value={alignTextBaselineValue}
          />
        )}
        {!isGridLayout && (
          <PopoverAutoLayoutSettingsAutoSpacing
            onHoverOption={onHoverAutoSpacingOption}
            onMouseEnter={onMouseEnterAutoSpacing}
            onMouseLeave={onMouseLeaveAutoSpacing}
            onSelect={onSelectAutoSpacing}
            options={autoSpacingOptions}
            value={autoSpacingValue}
          />
        )}
        <PopoverAutoLayoutSettingsLayout
          onHoverOption={onHoverLayoutOption}
          onMouseEnter={onMouseEnterLayout}
          onMouseLeave={onMouseLeaveLayout}
          onSelect={onSelectLayout}
          options={layoutOptions}
          value={layoutValue}
        />
      </div>
    </div>
  );
};

export default PopoverAutoLayoutSettings;
