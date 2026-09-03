import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Avatar from './Avatar/Avatar';
import PresentShare from './PresentShare/PresentShare';
import Tabs from 'shared/UITools/Tabs/Tabs';
import ZoomMenu from './ZoomMenu/ZoomMenu';
import { ButtonMenu, Icon } from 'shared';

// others
import { VIEW_MODE_TABS, translationNameSpace } from './constants';

// store
import { selectViewport } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './header.module.scss';

// types
import { TTab } from 'shared/UITools/Tabs/types';

const Header: FC = () => {
  const { t } = useTranslation();
  const viewport = useAppSelector(selectViewport);
  const [activeTab, setActiveTab] = useState<TTab['name']>('design');
  const zoomPercentage = Math.round(viewport.zoom * 100);

  return (
    <div className={styles.Header}>
      <div className={styles.Header__top}>
        <Avatar />
        <PresentShare />
      </div>
      <div className={styles.Header__navigation}>
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={VIEW_MODE_TABS} />
        <ButtonMenu
          align="end"
          className={styles['Header__zoom-menu']}
          trigger={
            <span className={styles.Header__zoom}>
              {zoomPercentage}%<Icon name="ChevronDown" size={16} />
            </span>
          }
          triggerAriaLabel={t(`${translationNameSpace}.zoomAriaLabel`)}
        >
          <ZoomMenu />
        </ButtonMenu>
      </div>
    </div>
  );
};

export default Header;
