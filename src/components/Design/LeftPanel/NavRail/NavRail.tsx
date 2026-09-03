import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import LogoMenu from './LogoMenu/LogoMenu';
import { Icon, Text } from 'shared';

// hooks
import { useSelectNavItem } from './hooks/useSelectNavItem';

// others
import { NAV_ITEM_ICON, NAV_ITEM_LABEL, NAV_ITEM_ORDER } from './constants';

// styles
import styles from './nav-rail.module.scss';

// types
import { TNavRailProps } from './types';

const NavRail: FC<TNavRailProps> = ({ activeNavItem, onSelectNavItem }) => {
  const { t } = useTranslation();
  const handleSelectNavItem = useSelectNavItem(onSelectNavItem);

  return (
    <div className={styles.NavRail}>
      <LogoMenu />
      <div className={styles.NavRail__spacer} />
      <ToggleGroupPrimitive.Root className={styles.NavRail__items} onValueChange={handleSelectNavItem} type="single" value={activeNavItem}>
        {NAV_ITEM_ORDER.map((name, index) => {
          const isLast = index === NAV_ITEM_ORDER.length - 1;

          return (
            <Fragment key={name}>
              {isLast && <div className={styles.NavRail__spacer} />}
              <div className={styles['NavRail__item-group']}>
                <ToggleGroupPrimitive.Item aria-label={name} className={styles.NavRail__button} value={name}>
                  <Icon name={NAV_ITEM_ICON[name]} size={24} />
                </ToggleGroupPrimitive.Item>
                <Text className={styles.NavRail__label} fontSize={9}>
                  {t(NAV_ITEM_LABEL[name])}
                </Text>
              </div>
            </Fragment>
          );
        })}
      </ToggleGroupPrimitive.Root>
    </div>
  );
};

export default NavRail;
