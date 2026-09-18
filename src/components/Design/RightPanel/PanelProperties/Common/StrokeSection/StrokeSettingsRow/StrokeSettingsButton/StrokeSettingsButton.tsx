import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeSettingsPanel from './StrokeSettingsPanel/StrokeSettingsPanel';
import { UITools } from 'shared';

// hooks
import { usePanelEdgeSideOffset } from 'components/Design/RightPanel/hooks/usePanelEdgeSideOffset';
import { useStrokeSettingsButton } from './hooks/useStrokeSettingsButton';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './stroke-settings-button.module.scss';

export const StrokeSettingsButton: FC = () => {
  const { t } = useTranslation();
  const { onClose, onOpenChange, open } = useStrokeSettingsButton();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sideOffset = usePanelEdgeSideOffset(triggerRef, open);

  return (
    <UITools.Popover
      align="start"
      asChild
      className={styles.StrokeSettingsButtonPopover}
      moveable
      onOpenChange={onOpenChange}
      open={open}
      side="left"
      sideOffset={sideOffset}
      trigger={
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.advancedSettingsAriaLabel`)}
          name="Properties"
          ref={triggerRef}
          selected={open}
        />
      }
      triggerTooltip={t(`${translationNameSpace}.advancedSettingsTooltip`)}
    >
      <StrokeSettingsPanel onClose={onClose} />
    </UITools.Popover>
  );
};

export default StrokeSettingsButton;
