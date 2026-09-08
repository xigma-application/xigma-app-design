import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { translationNameSpace } from './constants';

// styles
import styles from './frame-header-buttons.module.scss';

const FrameHeaderButtons: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.FrameHeaderButtons}>
      <Tooltip align="end" content={t(`${translationNameSpace}.htmlTagTooltip`)}>
        <Button ariaLabel={t(`${translationNameSpace}.htmlTagAriaLabel`)} onClick={() => {}} style={{ padding: 0 }}>
          <Icon name="HtmlTag" size={24} />
        </Button>
      </Tooltip>
      <Tooltip
        align="end"
        content={
          <Fragment>
            {t(`${translationNameSpace}.componentTooltip`)}
            <span className={styles.FrameHeaderButtons__shortcut}>{KEYBOARD_SHORTCUTS.createComponent.join('')}</span>
          </Fragment>
        }
      >
        <Button ariaLabel={t(`${translationNameSpace}.componentAriaLabel`)} onClick={() => {}} style={{ padding: 0 }}>
          <Icon name="Component" size={24} />
        </Button>
      </Tooltip>
    </div>
  );
};

export default FrameHeaderButtons;
