import { FC, useState } from 'react';

// components
import Avatar from './Avatar/Avatar';
import PresentShare from './PresentShare/PresentShare';
import Tabs from 'shared/UITools/Tabs/Tabs';
import ZoomTrigger from './ZoomTrigger/ZoomTrigger';

// others
import { VIEW_MODE_TABS } from './constants';

// styles
import styles from './header.module.scss';

// types
import { TTab } from 'shared/UITools/Tabs/types';

const Header: FC = () => {
  const [activeTab, setActiveTab] = useState<TTab['name']>('design');

  return (
    <div className={styles.Header}>
      <div className={styles.Header__top}>
        <Avatar />
        <PresentShare />
      </div>
      <div className={styles.Header__navigation}>
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={VIEW_MODE_TABS} />
        <ZoomTrigger />
      </div>
    </div>
  );
};

export default Header;
