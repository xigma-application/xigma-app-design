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
import { useColorModel } from './hooks/useColorModel';
import { useColorSampler } from './hooks/useColorSampler';
import { useHandleInteractOutside } from './hooks/useHandleInteractOutside';
import { useHandleOpenChange } from './hooks/useHandleOpenChange';
import { useIgnoreGradientCanvasInteractOutside } from './hooks/useIgnoreGradientCanvasInteractOutside';
import { useIgnoreSamplerInteractOutside } from './hooks/useIgnoreSamplerInteractOutside';
import { useNotifyGradientPanelState } from './hooks/useNotifyGradientPanelState';
import { useOpenSessionId } from './hooks/useOpenSessionId';
import { usePopoverOpenChange } from './hooks/usePopoverOpenChange';
import { useResetActiveTabOnReopen } from './hooks/useResetActiveTabOnReopen';
import { useSetActiveTab } from './hooks/useSetActiveTab';
import { useGradientPanel } from './Body/GradientPanel/hooks/useGradientPanel/useGradientPanel';

// others
import { DEFAULT_ACTIVE_TAB, DEFAULT_LIBRARY_TAB, DEFAULT_PRESETS } from './constants';
import { CUSTOM_LIBRARY_TABS } from './Header/constants';
import { DockedPanelContext } from './DockedPanelContext';

// styles
import styles from './color-picker.module.scss';

// types
import { ColorPickerTab } from './enums';
import { TColorPickerPreview, TColorPickerProps } from './types';

// utils
import { getGradientPreviewStyle } from './utils/getGradientPreviewStyle';

export const ColorPicker: FC<TColorPickerProps> = ({
  align,
  avoidCollisions,
  className = '',
  freezePositionOnGrow,
  headerExtra,
  initialActiveTab,
  initialGradient,
  isPointerOverGradientHandle,
  moveable = false,
  onChange,
  onDragEnd,
  onDragStart,
  onGradientChange,
  onGradientPanelStateChange,
  onOpenChange,
  paintTypeRow = false,
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
  const gradientPanel = useGradientPanel(onGradientChange, initialGradient, openSessionId);
  const handleSetActiveTab = useSetActiveTab(setActiveTab, onChange, value, gradientPanel, onGradientChange);
  const colorSampler = useColorSampler(colorModel.setHex);
  const ignoreSamplerInteractOutside = useIgnoreSamplerInteractOutside(colorSampler.isActive);
  const ignoreGradientCanvasInteractOutside = useIgnoreGradientCanvasInteractOutside(isPointerOverGradientHandle);
  const handlePopoverOpenChange = usePopoverOpenChange(colorSampler.close, onOpenChange);
  const handleOpenChange = useHandleOpenChange(setIsOpen, handlePopoverOpenChange);
  const handleInteractOutside = useHandleInteractOutside(ignoreSamplerInteractOutside, ignoreGradientCanvasInteractOutside);
  const preview: TColorPickerPreview =
    activeTab === ColorPickerTab.gradient
      ? { style: getGradientPreviewStyle(gradientPanel.stops, gradientPanel.type, gradientPanel.angle), type: 'gradient' }
      : { type: 'solid', value };

  useResetActiveTabOnReopen(openSessionId, initialActiveTab, DEFAULT_ACTIVE_TAB, setActiveTab);
  useNotifyGradientPanelState(activeTab, gradientPanel, onGradientPanelStateChange);

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
            onCloseSampler={colorSampler.close}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onOpenSampler={colorSampler.open}
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
