import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Button from 'shared/UITools/Button/Button';
import { Icon, Tooltip } from 'shared';

// others
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
      <Tooltip align="end" content={t(`${translationNameSpace}.componentTooltip`)}>
        <Button ariaLabel={t(`${translationNameSpace}.componentAriaLabel`)} onClick={() => {}} style={{ padding: 0 }}>
          <Icon name="Component" size={24} />
        </Button>
      </Tooltip>
      <Tooltip align="end" content={t(`${translationNameSpace}.maskTooltip`)}>
        <Button ariaLabel={t(`${translationNameSpace}.maskAriaLabel`)} onClick={() => {}} style={{ padding: 0 }}>
          <Icon name="Mask" size={24} />
        </Button>
      </Tooltip>
    </div>
  );
};

export default FrameHeaderButtons;
