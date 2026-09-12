import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import CornerSmoothingPopover from './CornerSmoothingPopover/CornerSmoothingPopover';
import { Icon, UITools } from 'shared';

// hooks
import { useCornerSmoothingButton } from './hooks/useCornerSmoothingButton';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './corner-smoothing-button.module.scss';

export const CornerSmoothingButton: FC = () => {
  const { t } = useTranslation();
  const { onClose, onOpenChange, open } = useCornerSmoothingButton();

  return (
    <UITools.Popover
      align="end"
      asChild
      className={styles.CornerSmoothingButtonPopover}
      moveable
      onOpenChange={onOpenChange}
      open={open}
      side="bottom"
      trigger={
        <UITools.Button ariaLabel={t(`${translationNameSpace}.cornerRadius.smoothingAriaLabel`)} selected={open} style={{ padding: 6 }}>
          <Icon name="Properties" size={12} />
        </UITools.Button>
      }
      triggerTooltip={t(`${translationNameSpace}.cornerRadius.smoothingTooltip`)}
    >
      <CornerSmoothingPopover onClose={onClose} />
    </UITools.Popover>
  );
};

export default CornerSmoothingButton;
