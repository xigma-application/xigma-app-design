import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// hooks
import { useUseSelectionAsMask } from 'components/Design/Menu/hooks/useUseSelectionAsMask';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

// styles
import styles from './panel-header.module.scss';

export const PanelHeaderMaskButton: FC = () => {
  const { t } = useTranslation();
  const handleUseAsMask = useUseSelectionAsMask();

  return (
    <Tooltip
      align="end"
      content={
        <Fragment>
          {t(`${translationNameSpace}.maskTooltip`)}
          <span className={styles.PanelHeader__shortcut}>{KEYBOARD_SHORTCUTS.useAsMask.join('')}</span>
        </Fragment>
      }
    >
      <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.maskAriaLabel`)} name="Mask" onClick={handleUseAsMask} />
    </Tooltip>
  );
};

export default PanelHeaderMaskButton;
