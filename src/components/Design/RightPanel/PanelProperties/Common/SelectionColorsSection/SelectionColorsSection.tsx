import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import SelectionColorRow from './SelectionColorRow/SelectionColorRow';
import SelectionColorsSectionHeader from './SelectionColorsSectionHeader/SelectionColorsSectionHeader';
import { UITools } from 'shared';

// hooks
import { useSelectionColorsSection } from './hooks/useSelectionColorsSection/useSelectionColorsSection';
import { useToggleSelectionColorsExpanded } from './hooks/useToggleSelectionColorsExpanded';

// others
import { MAX_SELECTION_COLOR_PREVIEW, translationNameSpace } from './constants';

// styles
import styles from './selection-colors-section.module.scss';

export const SelectionColorsSection: FC = () => {
  const { t } = useTranslation();
  const { getSelectionCount, groups, hasChildren, onChange, onOpenChange, onSelectNodes, openGroupKey } = useSelectionColorsSection();
  const { handleToggleClick, handleToggleKeyDown, isExpanded } = useToggleSelectionColorsExpanded();
  const isCollapsible = groups.length > MAX_SELECTION_COLOR_PREVIEW;
  const showRows = !isCollapsible || isExpanded;

  if (!hasChildren) {
    return null;
  }

  return (
    <UITools.Section
      e2eValue="selectionColors"
      hasContent={showRows && groups.length > 0}
      label={isCollapsible ? undefined : t(`${translationNameSpace}.label`)}
      mutedWhenEmpty={!isCollapsible}
    >
      {isCollapsible && (
        <SelectionColorsSectionHeader
          groups={groups}
          isExpanded={isExpanded}
          onToggleClick={handleToggleClick}
          onToggleKeyDown={handleToggleKeyDown}
        />
      )}
      {showRows && (
        <div className={styles.SelectionColorsSection__rows}>
          {groups.map((group) => (
            <SelectionColorRow
              group={group}
              isOpen={group.key === openGroupKey}
              key={group.key}
              onChange={(paint): void => onChange(group.occurrences, paint)}
              onOpenChange={(isOpen): void => onOpenChange(group, isOpen)}
              onSelectNodes={(): void => onSelectNodes(group.occurrences)}
              selectionCount={getSelectionCount(group.occurrences)}
            />
          ))}
        </div>
      )}
    </UITools.Section>
  );
};

export default SelectionColorsSection;
