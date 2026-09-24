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

export type TStrokeSettingsButtonProps = {
  disabled?: boolean;
};

export const StrokeSettingsButton: FC<TStrokeSettingsButtonProps> = ({ disabled = false }) => {
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
      open={open && !disabled}
      side="left"
      sideOffset={sideOffset}
      trigger={
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.advancedSettingsAriaLabel`)}
          disabled={disabled}
          name="Properties"
          ref={triggerRef}
          selected={open && !disabled}
        />
      }
      triggerTooltip={t(`${translationNameSpace}.advancedSettingsTooltip`)}
    >
      <StrokeSettingsPanel onClose={onClose} />
    </UITools.Popover>
  );
};

export default StrokeSettingsButton;
