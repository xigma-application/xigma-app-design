import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

// styles
import styles from './panel-header.module.scss';

export const PanelHeaderComponentButton: FC = () => {
  const { t } = useTranslation();

  return (
    <Tooltip
      align="end"
      content={
        <Fragment>
          {t(`${translationNameSpace}.componentTooltip`)}
          <span className={styles.PanelHeader__shortcut}>{KEYBOARD_SHORTCUTS.createComponent.join('')}</span>
        </Fragment>
      }
    >
      <Button ariaLabel={t(`${translationNameSpace}.componentAriaLabel`)} onClick={() => {}} style={{ padding: 0 }}>
        <Icon name="Component" size={24} />
      </Button>
    </Tooltip>
  );
};

export default PanelHeaderComponentButton;
