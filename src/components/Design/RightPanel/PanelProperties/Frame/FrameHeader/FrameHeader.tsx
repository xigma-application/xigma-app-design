import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import FrameHeaderButtons from './FrameHeaderButtons';
import FrameHeaderMenu from './FrameHeaderMenu';
import { ButtonMenu, ComponentHeader, Icon } from 'shared';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './frame-header.module.scss';

const FrameHeader: FC = () => {
  const { t } = useTranslation();

  return (
    <ComponentHeader buttons={<FrameHeaderButtons />} e2eValue="frame">
      <ButtonMenu
        className={styles.FrameHeader__trigger}
        trigger={
          <span className={styles.FrameHeader__label}>
            {t(`${translationNameSpace}.label`)}
            <Icon name="ChevronDown" size={16} />
          </span>
        }
        triggerAriaLabel={t(`${translationNameSpace}.menuAriaLabel`)}
      >
        <FrameHeaderMenu />
      </ButtonMenu>
    </ComponentHeader>
  );
};

export default FrameHeader;
