import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeaderComponentMenuItems from './PanelHeaderComponentMenuItems';
import { Icon, Tooltip, UITools } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

// styles
import styles from './panel-header.module.scss';

export const PanelHeaderComponentSplitButton: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.PanelHeader__split}>
      <Tooltip
        align="end"
        content={
          <Fragment>
            {t(`${translationNameSpace}.componentTooltip`)}
            <span className={styles.PanelHeader__shortcut}>{KEYBOARD_SHORTCUTS.createComponent.join('')}</span>
          </Fragment>
        }
      >
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.componentAriaLabel`)}
          className={styles['PanelHeader__split-button']}
          name="Component"
        />
      </Tooltip>
      <UITools.ButtonMenu
        align="end"
        className={styles['PanelHeader__split-options']}
        trigger={<Icon name="ChevronDown" size={24} />}
        triggerAriaLabel={t(`${translationNameSpace}.componentMenuAriaLabel`)}
      >
        <PanelHeaderComponentMenuItems />
      </UITools.ButtonMenu>
    </div>
  );
};

export default PanelHeaderComponentSplitButton;
