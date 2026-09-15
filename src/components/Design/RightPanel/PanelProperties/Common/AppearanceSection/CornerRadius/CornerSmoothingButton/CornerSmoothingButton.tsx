import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// components
import CornerSmoothingPopover from './CornerSmoothingPopover/CornerSmoothingPopover';
import { UITools } from 'shared';

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
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.cornerRadius.smoothingAriaLabel`)}
          name="Properties"
          ref={triggerRef}
          selected={open}
        />
      }
      triggerTooltip={t(`${translationNameSpace}.cornerRadius.smoothingTooltip`)}
    >
      <CornerSmoothingPopover onClose={onClose} />
    </UITools.Popover>
  );
};

export default CornerSmoothingButton;
