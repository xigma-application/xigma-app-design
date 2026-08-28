import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import XigmaLogoShape from '@xigma/assets/xigma-logo-shape.svg?react';

// components
import { Icon } from 'shared';

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
      <button aria-label="xigma" className={styles.NavRail__logo} type="button">
        <XigmaLogoShape />
      </button>
      <div className={styles.NavRail__spacer} />
      <ToggleGroupPrimitive.Root className={styles.NavRail__items} onValueChange={handleSelectNavItem} type="single" value={activeNavItem}>
        {NAV_ITEM_ORDER.map((name) => {
          const isActive = name === activeNavItem;

          return (
            <div className={styles['NavRail__item-group']} key={name}>
              <ToggleGroupPrimitive.Item aria-label={name} className={styles.NavRail__button} value={name}>
                <Icon color={isActive ? 'blue1' : 'neutral1'} name={NAV_ITEM_ICON[name]} size={24} />
              </ToggleGroupPrimitive.Item>
              <span className={styles.NavRail__label}>{t(NAV_ITEM_LABEL[name])}</span>
            </div>
          );
        })}
      </ToggleGroupPrimitive.Root>
    </div>
  );
};

export default NavRail;
