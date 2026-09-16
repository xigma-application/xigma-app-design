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
import { useIgnoreGradientCanvasInteractOutside } from './hooks/useIgnoreGradientCanvasInteractOutside';
import { useIgnorePatternSourcePickingInteractOutside } from './hooks/useIgnorePatternSourcePickingInteractOutside';
import { useIgnoreSamplerInteractOutside } from './hooks/useIgnoreSamplerInteractOutside';
import { useNotifyGradientPanelState } from './hooks/useNotifyGradientPanelState';
import { useNotifyImagePanelState } from './hooks/useNotifyImagePanelState';
import { useOpenSessionId } from './hooks/useOpenSessionId';
import { usePatternSourcePicking } from './hooks/usePatternSourcePicking';
import { usePopoverOpenChange } from './hooks/usePopoverOpenChange';
import { useResetActiveTabOnReopen } from './hooks/useResetActiveTabOnReopen';
import { useSetActiveTab } from './hooks/useSetActiveTab';
import { useTrackIsDragging } from './hooks/useTrackIsDragging';
import { useGradientPanel } from './Body/GradientPanel/hooks/useGradientPanel/useGradientPanel';
import { useImagePanel } from './Body/ImagePanel/hooks/useImagePanel';
import { usePatternPanel } from './Body/PatternPanel/hooks/usePatternPanel';

// others
import { DEFAULT_ACTIVE_TAB, DEFAULT_LIBRARY_TAB, DEFAULT_PRESETS } from './constants';
import { CUSTOM_LIBRARY_TABS } from './Header/constants';
import { DockedPanelContext } from './DockedPanelContext';

// styles
import styles from './color-picker.module.scss';

// types
import { ColorPickerTab } from './enums';
import { TColorPickerProps } from './types';

// utils
import { getColorPickerPreview } from './utils/getColorPickerPreview';

export const ColorPicker: FC<TColorPickerProps> = ({
  align,
  avoidCollisions,
  className = '',
  freezePositionOnGrow,
  headerExtra,
  initialActiveTab,
  initialGradient,
  initialPattern,
  isPointerOverGradientHandle,
  moveable = false,
  onChange,
  onDragEnd,
  onDragStart,
  onGradientChange,
  onGradientPanelStateChange,
  onImageChange,
  onImageRotate,
  onImageScaleModeChange,
  onImageUrlChange,
  onOpenChange,
  onPatternChange,
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
}) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab ?? DEFAULT_ACTIVE_TAB);
  const [libraryTab, setLibraryTab] = useState(DEFAULT_LIBRARY_TAB);
  const [dockedPanel, setDockedPanel] = useState<ReactNode>(null);
  const [isOpen, setIsOpen] = useState(false);
  const openSessionId = useOpenSessionId(isOpen);
  const colorModel = useColorModel(value, onChange);
  const { handleDragEnd, handleDragStart, isDraggingRef } = useTrackIsDragging(onDragStart, onDragEnd);
  const gradientPanel = useGradientPanel(onGradientChange, initialGradient, openSessionId, isDraggingRef);
  const imagePanel = useImagePanel();
  const patternPanel = usePatternPanel(onPatternChange, initialPattern, openSessionId);
  const colorSampler = useColorSampler(colorModel.setHex);
  const patternSourcePicking = usePatternSourcePicking();
  const ignoreSamplerInteractOutside = useIgnoreSamplerInteractOutside(colorSampler.isActive);
  const ignoreGradientCanvasInteractOutside = useIgnoreGradientCanvasInteractOutside(isPointerOverGradientHandle);
  const ignorePatternSourcePickingInteractOutside = useIgnorePatternSourcePickingInteractOutside(patternSourcePicking.isActive);
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
  );
  const handleInteractOutside = useHandleInteractOutside(
    ignoreSamplerInteractOutside,
    ignoreGradientCanvasInteractOutside,
    ignorePatternSourcePickingInteractOutside,
  );

  useResetActiveTabOnReopen(openSessionId, initialActiveTab, DEFAULT_ACTIVE_TAB, setActiveTab);
  useNotifyGradientPanelState(activeTab, gradientPanel, onGradientPanelStateChange);
  useNotifyImagePanelState(imagePanel, onImageUrlChange, onImageChange);
  useClosePatternSourcePickingOnEscape(patternSourcePicking.isActive, patternSourcePicking.close);

  return (
    <Popover
      align={align}
      avoidCollisions={avoidCollisions}
      className={styles.ColorPicker__popover}
      freezePositionOnGrow={freezePositionOnGrow}
      moveable={moveable}
      onInteractOutside={handleInteractOutside}
      onOpenChange={handleOpenChange}
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
        {paintTypeRow && <PaintTypeRow activeTab={activeTab} onSelectTab={handleSetActiveTab} />}
        <DockedPanelContext.Provider value={setDockedPanel}>
          <Body
            activeTab={activeTab}
            alpha={value.alpha}
            colorModel={colorModel}
            gradientPanel={gradientPanel}
            imagePanel={imagePanel}
            onCloseSampler={colorSampler.close}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            onImageRotate={onImageRotate}
            onImageScaleModeChange={onImageScaleModeChange}
            onOpenSampler={colorSampler.open}
            patternPanel={patternPanel}
            patternSourceNodeId={patternSourceNodeId}
            patternSourcePicking={patternSourcePicking}
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
