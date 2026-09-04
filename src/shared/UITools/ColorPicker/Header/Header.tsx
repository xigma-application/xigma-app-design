import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

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
      <UITools.Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
      <Tooltip content={t('common.close')}>
        <PopoverPrimitive.Close asChild>
          <UITools.Button ariaLabel={t('common.close')} className={styles.Header__close}>
            <Icon name="Close" size={22} />
          </UITools.Button>
        </PopoverPrimitive.Close>
      </Tooltip>
    </div>
  );
};

export default Header;
