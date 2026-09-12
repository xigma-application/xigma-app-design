import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PopoverAutoLayoutSettings from './PopoverAutoLayoutSettings/PopoverAutoLayoutSettings';
import { Icon, UITools } from 'shared';

// hooks
import { usePanelEdgeSideOffset } from 'components/Design/RightPanel/hooks/usePanelEdgeSideOffset';
import { useAutoLayoutSettingsButton } from './hooks/useAutoLayoutSettingsButton';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './auto-layout-settings-button.module.scss';

export const AutoLayoutSettingsButton: FC = () => {
  const { t } = useTranslation();
  const { layoutMode, onClose, onOpenChange, open } = useAutoLayoutSettingsButton();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sideOffset = usePanelEdgeSideOffset(triggerRef, open);

  return (
    <UITools.Popover
      align="start"
      asChild
      className={styles.AutoLayoutSettingsButtonPopover}
      moveable
      onOpenChange={onOpenChange}
      open={open}
      side="left"
      sideOffset={sideOffset}
      trigger={
        <UITools.Button
          ariaLabel={t(`${translationNameSpace}.propertiesAriaLabel`)}
          ref={triggerRef}
          selected={open}
          style={{ padding: 6 }}
        >
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
