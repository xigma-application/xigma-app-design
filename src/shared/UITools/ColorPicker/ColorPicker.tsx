import cx from 'classnames';
import { FC, useState } from 'react';

// components
import Body from './Body/Body';
import ColorSampler from './ColorSampler/ColorSampler';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import Popover from 'shared/UITools/Popover/Popover';

// hooks
import { useColorModel } from './hooks/useColorModel';
import { useColorSampler } from './hooks/useColorSampler';
import { useSetActiveTab } from './hooks/useSetActiveTab';

// others
import { DEFAULT_ACTIVE_TAB, DEFAULT_PRESETS } from './constants';

// styles
import styles from './color-picker.module.scss';

// types
import { TColorPickerProps } from './types';

export const ColorPicker: FC<TColorPickerProps> = ({
  align,
  className = '',
  moveable = false,
  onChange,
  onOpenChange,
  presets = DEFAULT_PRESETS,
  side,
  sideOffset,
  trigger,
  triggerAriaLabel,
  value,
}) => {
  const [activeTab, setActiveTab] = useState(DEFAULT_ACTIVE_TAB);
  const handleSetActiveTab = useSetActiveTab(setActiveTab);
  const colorModel = useColorModel(value, onChange);
  const colorSampler = useColorSampler(colorModel.setHex);

  return (
    <Popover
      align={align}
      className={styles.ColorPicker__popover}
      moveable={moveable}
      onOpenChange={onOpenChange}
      side={side}
      sideOffset={sideOffset}
      trigger={trigger}
      triggerAriaLabel={triggerAriaLabel}
    >
      <div className={cx(styles.ColorPicker, className)}>
        <Header activeTab={activeTab} setActiveTab={handleSetActiveTab} />
        <Body alpha={value.alpha} colorModel={colorModel} onOpenSampler={colorSampler.open} />
        <Footer onSelectPreset={colorModel.setPreset} presets={presets} />
      </div>
      {colorSampler.isActive && <ColorSampler onClose={colorSampler.close} onPick={colorSampler.pick} />}
    </Popover>
  );
};

export default ColorPicker;
