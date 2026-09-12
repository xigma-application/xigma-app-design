import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// components
import CornerSmoothingPopover from './CornerSmoothingPopover/CornerSmoothingPopover';
import { Icon, UITools } from 'shared';

// hooks
import { usePanelEdgeSideOffset } from 'components/Design/RightPanel/hooks/usePanelEdgeSideOffset';
import { useCornerSmoothingButton } from './hooks/useCornerSmoothingButton';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './corner-smoothing-button.module.scss';

export const CornerSmoothingButton: FC = () => {
  const { t } = useTranslation();
  const { onClose, onOpenChange, open } = useCornerSmoothingButton();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sideOffset = usePanelEdgeSideOffset(triggerRef, open);

  return (
    <UITools.Popover
      align="start"
      asChild
      className={styles.CornerSmoothingButtonPopover}
      moveable
      onOpenChange={onOpenChange}
      open={open}
      side="left"
      sideOffset={sideOffset}
      trigger={
        <UITools.Button
          ariaLabel={t(`${translationNameSpace}.cornerRadius.smoothingAriaLabel`)}
          ref={triggerRef}
          selected={open}
          style={{ padding: 6 }}
        >
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
