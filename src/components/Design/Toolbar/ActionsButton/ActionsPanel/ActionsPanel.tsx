import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useActionsPanelItemClick } from './hooks/useActionsPanelItemClick';
import { useFilteredActionsPanelSections } from './hooks/useFilteredActionsPanelSections';

// others
import { ITEM_ICON_SIZE, SECTION_LABEL_KEY, TABS, translationNameSpace } from './constants';

// store
import { selectAreRulersVisible, selectIsUiHidden, selectIsUiMinimized } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './actions-panel.module.scss';

// types
import { TTab } from 'shared/UITools/Tabs/types';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

export const ActionsPanel: FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TTab['name']>('all');
  const sections = useFilteredActionsPanelSections(query);
  const handleItemClick = useActionsPanelItemClick();
  const areRulersVisible = useAppSelector(selectAreRulersVisible);
  const isUiHidden = useAppSelector(selectIsUiHidden);
  const isUiMinimized = useAppSelector(selectIsUiMinimized);
  const selectedById: Record<string, boolean> = {
    minimizeUi: isUiMinimized,
    showHideUi: isUiHidden,
    showRulers: areRulersVisible,
  };

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content align="center" className={styles.ActionsPanel} side="top" sideOffset={10}>
        <UITools.SearchInput
          ariaLabel={t(`${translationNameSpace}.searchPlaceholder`)}
          autoFocus
          className={styles.ActionsPanel__search}
          onChange={setQuery}
          placeholder={t(`${translationNameSpace}.searchPlaceholder`)}
          value={query}
        />
        <UITools.Tabs activeTab={activeTab} className={styles.ActionsPanel__tabs} setActiveTab={setActiveTab} tabs={TABS} />
        <div className={styles.ActionsPanel__list}>
          {sections.map(({ items, section }, index) => (
            <div key={section}>
              {index > 0 && <PopoverSeparator />}
              <div className={styles.ActionsPanel__sectionLabel}>{t(SECTION_LABEL_KEY[section])}</div>
              {items.map((item) => (
                <PopoverItem
                  checkVariant="checkbox"
                  className={styles.ActionsPanel__item}
                  disabled={!item.action}
                  icon={item.icon}
                  iconSize={ITEM_ICON_SIZE}
                  key={item.id}
                  label={t(item.labelKey)}
                  onClick={item.action ? (): void => handleItemClick(item.action) : undefined}
                  selected={selectedById[item.id]}
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
