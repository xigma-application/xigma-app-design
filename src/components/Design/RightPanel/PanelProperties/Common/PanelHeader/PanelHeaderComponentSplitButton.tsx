import { FC, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeaderComponentMenuItems from './PanelHeaderComponentMenuItems';
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { useCreateComponent } from './hooks/useCreateComponent';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

// styles
import styles from './panel-header.module.scss';

export const PanelHeaderComponentSplitButton: FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleCreateComponent = useCreateComponent();

  return (
    <div className={styles.PanelHeader__split}>
      <Tooltip
        align="end"
        content={
          isMenuOpen ? undefined : (
            <Fragment>
              {t(`${translationNameSpace}.componentTooltip`)}
              <span className={styles.PanelHeader__shortcut}>{KEYBOARD_SHORTCUTS.createComponent.join('')}</span>
            </Fragment>
          )
        }
      >
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.componentAriaLabel`)}
          className={styles['PanelHeader__split-button']}
          name="Component"
          onClick={handleCreateComponent}
        />
      </Tooltip>
      <UITools.ButtonMenu
        align="end"
        className={styles['PanelHeader__split-options']}
        onOpenChange={setIsMenuOpen}
        trigger={<Icon name="ChevronDown" size={24} />}
        triggerAriaLabel={t(`${translationNameSpace}.componentMenuAriaLabel`)}
      >
        <PanelHeaderComponentMenuItems />
      </UITools.ButtonMenu>
    </div>
  );
};

export default PanelHeaderComponentSplitButton;
