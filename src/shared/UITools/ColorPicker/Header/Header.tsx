import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// others
import { TABS } from './constants';

// styles
import styles from './header.module.scss';

// types
import { TTab } from 'shared/UITools/Tabs/types';

export type THeaderProps = {
  activeTab: TTab['name'];
  extra?: ReactNode;
  setActiveTab: TFunc<[TTab['name']]>;
  tabs?: TTab[];
  title?: string;
};

export const Header: FC<THeaderProps> = ({ activeTab, extra, setActiveTab, tabs = TABS, title }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.Header}>
      {title ? (
        <span className={styles.Header__title}>{title}</span>
      ) : (
        <UITools.Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
      )}
      <div className={styles.Header__actions}>
        {extra}
        <Tooltip content={t('common.close')}>
          <PopoverPrimitive.Close asChild>
            <UITools.Button ariaLabel={t('common.close')} className={styles.Header__close}>
              <Icon name="Close" size={22} />
            </UITools.Button>
          </PopoverPrimitive.Close>
        </Tooltip>
      </div>
    </div>
  );
};

export default Header;
