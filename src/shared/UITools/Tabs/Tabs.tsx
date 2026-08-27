import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Tooltip } from '@xigma/components';

// hooks
import { useTabClick } from './hooks/useTabClick';

// styles
import styles from './tabs.module.scss';

// types
import { TTab } from './types';

export type TTabsProps = {
  activeTab: TTab['name'];
  className?: string;
  setActiveTab: TFunc<[TTab['name']]>;
  tabs: TTab[];
};

export const Tabs: FC<TTabsProps> = ({ activeTab, className = '', setActiveTab, tabs }) => {
  const { t } = useTranslation();
  const handleTabClick = useTabClick(setActiveTab);

  return (
    <div className={cx(styles.Tabs, className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        const label = t(tab.labelTranslationKey);

        return (
          <Tooltip content={label} key={tab.name}>
            <div
              className={cx(styles.Tabs__tab, {
                [styles['Tabs__tab--active']]: isActive,
                [styles['Tabs__tab--disabled']]: tab.disabled,
              })}
              data-no-drag
              onClick={handleTabClick(tab)}
            >
              {label}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default Tabs;
