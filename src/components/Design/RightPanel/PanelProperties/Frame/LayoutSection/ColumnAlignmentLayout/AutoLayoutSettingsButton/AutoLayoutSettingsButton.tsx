import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PopoverAutoLayoutSettings from './PopoverAutoLayoutSettings/PopoverAutoLayoutSettings';
import { Icon, UITools } from 'shared';

// hooks
import { useAutoLayoutSettingsButton } from './hooks/useAutoLayoutSettingsButton';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './auto-layout-settings-button.module.scss';

export const AutoLayoutSettingsButton: FC = () => {
  const { t } = useTranslation();
  const { layoutMode, onClose, onOpenChange, open } = useAutoLayoutSettingsButton();

  return (
    <UITools.Popover
      align="start"
      asChild
      className={styles.AutoLayoutSettingsButtonPopover}
      moveable
      onOpenChange={onOpenChange}
      open={open}
      side="left"
      trigger={
        <UITools.Button ariaLabel={t(`${translationNameSpace}.propertiesAriaLabel`)} selected={open} style={{ padding: 6 }}>
          <Icon name="Properties" size={12} />
        </UITools.Button>
      }
      triggerTooltip={t(`${translationNameSpace}.propertiesTooltip`)}
    >
      <PopoverAutoLayoutSettings layoutMode={layoutMode} onClose={onClose} />
    </UITools.Popover>
  );
};

export default AutoLayoutSettingsButton;
