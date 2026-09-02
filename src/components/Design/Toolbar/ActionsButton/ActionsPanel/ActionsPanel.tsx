import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { PopoverCompound, SearchInput, Tabs } from 'shared';

// hooks
import { useActionsPanelItemClick } from './hooks/useActionsPanelItemClick';
import { useFilteredActionsPanelSections } from './hooks/useFilteredActionsPanelSections';

// others
import { ITEM_ICON_SIZE, SECTION_LABEL_KEY, TABS, translationNameSpace } from './constants';

// styles
import styles from './actions-panel.module.scss';

// types
import { TTab } from 'shared/UITools/Tabs/types';

const { PopoverItem, PopoverSeparator } = PopoverCompound;

export const ActionsPanel: FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TTab['name']>('all');
  const sections = useFilteredActionsPanelSections(query);
  const handleItemClick = useActionsPanelItemClick();

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content align="center" className={styles.ActionsPanel} side="top" sideOffset={10}>
        <SearchInput
          ariaLabel={t(`${translationNameSpace}.searchPlaceholder`)}
          autoFocus
          className={styles.ActionsPanel__search}
          onChange={setQuery}
          placeholder={t(`${translationNameSpace}.searchPlaceholder`)}
          value={query}
        />
        <Tabs activeTab={activeTab} className={styles.ActionsPanel__tabs} setActiveTab={setActiveTab} tabs={TABS} />
        <div className={styles.ActionsPanel__list}>
          {sections.map(({ items, section }, index) => (
            <div key={section}>
              {index > 0 && <PopoverSeparator />}
              <div className={styles.ActionsPanel__sectionLabel}>{t(SECTION_LABEL_KEY[section])}</div>
              {items.map((item) => (
                <PopoverItem
                  disabled={!item.action}
                  icon={item.icon}
                  iconSize={ITEM_ICON_SIZE}
                  key={item.id}
                  label={t(item.labelKey)}
                  onClick={item.action ? (): void => handleItemClick(item.action) : undefined}
                  shortcut={item.shortcut}
                  withCheck={Boolean(item.withCheck)}
                />
              ))}
            </div>
          ))}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
};

export default ActionsPanel;
