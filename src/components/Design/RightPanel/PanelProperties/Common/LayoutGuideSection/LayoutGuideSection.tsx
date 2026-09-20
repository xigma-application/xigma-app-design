import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import FillDropIndicator from '../FillSection/FillDropIndicator/FillDropIndicator';
import LayoutGuideRow from './LayoutGuideRow/LayoutGuideRow';
import { UITools } from 'shared';

// hooks
import { useLayoutGuideSection } from './hooks/useLayoutGuideSection/useLayoutGuideSection';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './layout-guide-section.module.scss';

export const LayoutGuideSection: FC = () => {
  const { t } = useTranslation();
  const {
    containerRef,
    dropIndicatorOffset,
    guides,
    isRowDragging,
    isRowSelected,
    onAdd,
    onChange,
    onDragEnd,
    onDragStart,
    onOpenChange,
    onRemove,
    onSelectRow,
    onStartDrag,
    onToggleVisible,
    openIndex,
    registerRow,
  } = useLayoutGuideSection();

  return (
    <UITools.Section
      addAriaLabel={t(`${translationNameSpace}.addAriaLabel`)}
      addTooltip={t(`${translationNameSpace}.addTooltip`)}
      e2eValue="layout-guide"
      hasContent={guides.length > 0}
      label={t(`${translationNameSpace}.label`)}
      mutedWhenEmpty
      onAdd={onAdd}
    >
      <div className={styles.LayoutGuideSection__rows} ref={containerRef}>
        {dropIndicatorOffset !== null && <FillDropIndicator offset={dropIndicatorOffset} />}
        {guides.map((guide, index) => (
          <LayoutGuideRow
            canDrag={guides.length > 1}
            guide={guide}
            isDragging={isRowDragging(index)}
            isOpen={openIndex === index}
            isSelected={isRowSelected(index)}
            key={index}
            onChange={(next): void => onChange(index, next)}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onOpenChange={(isOpen): void => onOpenChange(index, isOpen)}
            onRemove={(): void => onRemove(index)}
            onSelect={(): void => onSelectRow(index)}
            onStartDrag={(event): void => onStartDrag(index, event)}
            onToggleVisible={(): void => onToggleVisible(index)}
            registerRow={registerRow(index)}
          />
        ))}
      </div>
    </UITools.Section>
  );
};

export default LayoutGuideSection;
