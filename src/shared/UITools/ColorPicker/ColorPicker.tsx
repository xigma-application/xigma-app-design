import cx from 'classnames';
import { FC, ReactNode, useState } from 'react';

// components
import Body from './Body/Body';
import ColorSampler from './ColorSampler/ColorSampler';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import PaintTypeRow from './PaintTypeRow/PaintTypeRow';
import Popover from 'shared/UITools/Popover/Popover';

// hooks
import { useClosePatternSourcePickingOnEscape } from './hooks/useClosePatternSourcePickingOnEscape';
import { useColorModel } from './hooks/useColorModel';
import { useColorSampler } from './hooks/useColorSampler';
import { useHandleInteractOutside } from './hooks/useHandleInteractOutside';
import { useHandleOpenChange } from './hooks/useHandleOpenChange';
import { useIgnoreDismissWhileImageTabActive } from './hooks/useIgnoreDismissWhileImageTabActive';
import { useIgnoreGradientCanvasInteractOutside } from './hooks/useIgnoreGradientCanvasInteractOutside';
import { useIgnorePatternSourcePickingInteractOutside } from './hooks/useIgnorePatternSourcePickingInteractOutside';
import { useIgnoreSamplerInteractOutside } from './hooks/useIgnoreSamplerInteractOutside';
import { useNotifyGradientPanelState } from './hooks/useNotifyGradientPanelState';
import { useNotifyImagePanelState } from './hooks/useNotifyImagePanelState';
import { useNotifyImageTabActiveState } from './hooks/useNotifyImageTabActiveState';
import { useNotifyVideoPanelState } from './hooks/useNotifyVideoPanelState';
import { useNotifyVideoTabActiveState } from './hooks/useNotifyVideoTabActiveState';
import { useOpenSessionId } from './hooks/useOpenSessionId';
import { usePatternSourcePicking } from './hooks/usePatternSourcePicking';
import { usePopoverOpenChange } from './hooks/usePopoverOpenChange';
import { useResetActiveTabOnReopen } from './hooks/useResetActiveTabOnReopen';
import { useSetActiveTab } from './hooks/useSetActiveTab';
import { useSyncFillModeWithImageEditorCrop } from './hooks/useSyncFillModeWithImageEditorCrop';
import { useTrackIsDragging } from './hooks/useTrackIsDragging';
import { useContrastChecker } from './Body/SolidPanel/ContrastChecker/hooks/useContrastChecker';
import { useGradientPanel } from './Body/GradientPanel/hooks/useGradientPanel/useGradientPanel';
import { useImagePanel } from './Body/ImagePanel/hooks/useImagePanel';
import { usePatternPanel } from './Body/PatternPanel/hooks/usePatternPanel';
import { useVideoPanel } from './Body/VideoPanel/hooks/useVideoPanel';

// others
import { DEFAULT_ACTIVE_TAB, DEFAULT_LIBRARY_TAB, DEFAULT_PRESETS } from './constants';
import { CUSTOM_LIBRARY_TABS } from './Header/constants';
import { DockedPanelContext } from './DockedPanelContext';

// styles
import styles from './color-picker.module.scss';

// types
import { BlendMode } from 'types/design/enums';
import { ColorPickerTab } from './enums';
import { TColorPickerProps } from './types';

// utils
import { getColorPickerPreview } from './utils/getColorPickerPreview';

export const ColorPicker: FC<TColorPickerProps> = ({
  align,
  availableTabs,
  avoidCollisions,
  blendMode = BlendMode.normal,
  className = '',
  contrastBackgroundColor,
  contrastUnsupportedReason,
  freezePositionOnGrow,
  headerExtra,
  imageAdjustments,
  imageTileScale,
  initialActiveTab,
  initialFillMode,
  initialGradient,
  initialImageUrl,
  initialOpen = false,
  initialPattern,
  initialVideoUrl,
  isPointerOverGradientHandle,
  moveable = false,
  onBlendModeChange,
  onChange,
  onDragEnd,
  onDragStart,
  onGradientChange,
  onGradientPanelStateChange,
  onImageAdjustmentChange,
  onImageChange,
  onImageRotate,
  onImageScaleModeChange,
  onImageTabActiveChange,
  onImageTileScaleChange,
  onImageUrlChange,
  onOpenChange,
  onPatternChange,
  onVideoChange,
  onVideoRotate,
  onVideoScaleModeChange,
  onVideoTabActiveChange,
  onVideoTileScaleChange,
  onVideoUrlChange,
  paintTypeRow = false,
  patternSourceNodeId,
  presets = DEFAULT_PRESETS,
  side,
  sideOffset,
  simple = false,
  title,
  trigger,
  triggerAriaLabel,
  triggerClassName,
  value,
  videoTileScale,
}) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab ?? DEFAULT_ACTIVE_TAB);
  const [libraryTab, setLibraryTab] = useState(DEFAULT_LIBRARY_TAB);
  const [dockedPanel, setDockedPanel] = useState<ReactNode>(null);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const openSessionId = useOpenSessionId(isOpen);
  const colorModel = useColorModel(value, onChange);
  const isContrastCheckerAvailable = Boolean(contrastBackgroundColor) || Boolean(contrastUnsupportedReason);
  const contrastChecker = useContrastChecker(colorModel.hsv, contrastBackgroundColor, colorModel.setHsv, contrastUnsupportedReason);
  const { handleDragEnd, handleDragStart, isDraggingRef } = useTrackIsDragging(onDragStart, onDragEnd);
  const gradientPanel = useGradientPanel(onGradientChange, initialGradient, openSessionId, isDraggingRef);
  const imagePanel = useImagePanel(initialImageUrl, initialFillMode);
  const videoPanel = useVideoPanel(initialVideoUrl, initialFillMode);
  const patternPanel = usePatternPanel(onPatternChange, initialPattern, openSessionId);
  const colorSampler = useColorSampler(colorModel.setHex);
  const patternSourcePicking = usePatternSourcePicking();
  const ignoreSamplerInteractOutside = useIgnoreSamplerInteractOutside(colorSampler.isActive);
  const ignoreGradientCanvasInteractOutside = useIgnoreGradientCanvasInteractOutside(isPointerOverGradientHandle);
  const ignorePatternSourcePickingInteractOutside = useIgnorePatternSourcePickingInteractOutside(patternSourcePicking.isActive);
  const isImageTabActive = activeTab === ColorPickerTab.image;
  const isVideoTabActive = activeTab === ColorPickerTab.video;
  const ignoreDismissWhileImageTabActive = useIgnoreDismissWhileImageTabActive(isImageTabActive || isVideoTabActive);
  const handlePopoverOpenChange = usePopoverOpenChange(colorSampler.close, patternSourcePicking.close, onOpenChange);
  const handleOpenChange = useHandleOpenChange(setIsOpen, handlePopoverOpenChange);
  const preview = getColorPickerPreview(activeTab, gradientPanel.stops, gradientPanel.type, gradientPanel.angle, value);

  const handleSetActiveTab = useSetActiveTab(
    activeTab,
    setActiveTab,
    onChange,
    value,
    gradientPanel,
    patternPanel,
    onGradientChange,
    onPatternChange,
    onImageChange,
    onVideoChange,
  );

  const handleInteractOutside = useHandleInteractOutside(
    ignoreSamplerInteractOutside,
    ignoreGradientCanvasInteractOutside,
    ignorePatternSourcePickingInteractOutside,
    ignoreDismissWhileImageTabActive,
  );

  useResetActiveTabOnReopen(openSessionId, initialActiveTab, DEFAULT_ACTIVE_TAB, setActiveTab);
  useNotifyGradientPanelState(activeTab, gradientPanel, onGradientPanelStateChange);
  useNotifyImagePanelState(imagePanel, onImageUrlChange, onImageChange);
  useNotifyImageTabActiveState(activeTab, onImageTabActiveChange);
  useNotifyVideoPanelState(videoPanel, onVideoUrlChange, onVideoChange);
  useNotifyVideoTabActiveState(activeTab, onVideoTabActiveChange);
  useClosePatternSourcePickingOnEscape(patternSourcePicking.isActive, patternSourcePicking.close);
  useSyncFillModeWithImageEditorCrop(isImageTabActive, imagePanel.setFillMode);
  useSyncFillModeWithImageEditorCrop(isVideoTabActive, videoPanel.setFillMode);

  return (
    <Popover
      align={align}
      avoidCollisions={avoidCollisions}
      className={styles.ColorPicker__popover}
      freezePositionOnGrow={freezePositionOnGrow}
      moveable={moveable}
      onEscapeKeyDown={ignoreDismissWhileImageTabActive}
      onInteractOutside={handleInteractOutside}
      onOpenChange={handleOpenChange}
      open={isOpen}
      side={side}
      sideOffset={sideOffset}
      trigger={typeof trigger === 'function' ? trigger(preview) : trigger}
      triggerAriaLabel={triggerAriaLabel}
      triggerClassName={triggerClassName}
    >
      <div className={cx(styles.ColorPicker, className)}>
        <Header
          activeTab={simple ? libraryTab : activeTab}
          extra={headerExtra}
          setActiveTab={simple ? setLibraryTab : handleSetActiveTab}
          tabs={simple ? CUSTOM_LIBRARY_TABS : undefined}
          title={title}
        />
        {paintTypeRow && (
          <PaintTypeRow
            activeTab={activeTab}
            availableTabs={availableTabs}
            blendMode={blendMode}
            contrastCheckerActive={contrastChecker.isActive}
            onBlendModeChange={onBlendModeChange}
            onSelectTab={handleSetActiveTab}
            onToggleContrastChecker={isContrastCheckerAvailable ? contrastChecker.onToggleActive : undefined}
          />
        )}
        <DockedPanelContext.Provider value={setDockedPanel}>
          <Body
            activeTab={activeTab}
            alpha={value.alpha}
            colorModel={colorModel}
            contrastChecker={isContrastCheckerAvailable ? contrastChecker : undefined}
            gradientPanel={gradientPanel}
            imageAdjustments={imageAdjustments}
            imagePanel={imagePanel}
            imageTileScale={imageTileScale}
            onCloseSampler={colorSampler.close}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            onImageAdjustmentChange={onImageAdjustmentChange}
            onImageRotate={onImageRotate}
            onImageScaleModeChange={onImageScaleModeChange}
            onImageTileScaleChange={onImageTileScaleChange}
            onOpenSampler={colorSampler.open}
            onVideoRotate={onVideoRotate}
            onVideoScaleModeChange={onVideoScaleModeChange}
            onVideoTileScaleChange={onVideoTileScaleChange}
            patternPanel={patternPanel}
            patternSourceNodeId={patternSourceNodeId}
            patternSourcePicking={patternSourcePicking}
            videoPanel={videoPanel}
            videoTileScale={videoTileScale}
          />
        </DockedPanelContext.Provider>
        {activeTab === ColorPickerTab.solid && <Footer onSelectPreset={colorModel.setPreset} presets={presets} />}
        {dockedPanel && <div className={styles.ColorPicker__docked}>{dockedPanel}</div>}
      </div>
      {colorSampler.isActive && <ColorSampler onClose={colorSampler.close} onPick={colorSampler.pick} />}
    </Popover>
  );
};

export default ColorPicker;
