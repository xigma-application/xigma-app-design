import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import Tabs from 'shared/UITools/Tabs/Tabs';
import { Button, Icon, Tooltip } from 'shared';

// others
import { TABS } from './constants';

// styles
import styles from './header.module.scss';

// types
import { ColorPickerTab } from '../enums';
import { TTab } from 'shared/UITools/Tabs/types';

export type THeaderProps = {
  activeTab: ColorPickerTab;
  setActiveTab: TFunc<[TTab['name']]>;
};

export const Header: FC<THeaderProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.Header}>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
      <Tooltip content={t('common.close')}>
        <PopoverPrimitive.Close asChild>
          <Button ariaLabel={t('common.close')} className={styles.Header__close}>
            <Icon name="Close" size={22} />
          </Button>
        </PopoverPrimitive.Close>
      </Tooltip>
    </div>
  );
};

export default Header;
