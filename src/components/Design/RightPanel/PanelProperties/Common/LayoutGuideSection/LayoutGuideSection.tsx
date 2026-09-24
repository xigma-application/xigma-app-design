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
    getMixedKeys,
    guides,
    isHidden,
    isMixed,
    isRowDragging,
    isRowSelected,
    isStretchedOnAny,
    onAdd,
    onChange,
    onDragEnd,
    onDragStart,
    onFieldScrub,
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
      hasContent={guides.length > 0 || isMixed}
      label={t(`${translationNameSpace}.label`)}
      mutedWhenEmpty
      onAdd={onAdd}
    >
      {isMixed && <UITools.SectionHint label={t(`${translationNameSpace}.mixedContent`)} />}
      <div className={styles.LayoutGuideSection__rows} ref={containerRef}>
        {dropIndicatorOffset !== null && <FillDropIndicator offset={dropIndicatorOffset} />}
        {guides.map((guide, index) => (
          <LayoutGuideRow
            canDrag={guides.length > 1}
            guide={guide}
            isDragging={isRowDragging(index)}
            isHidden={isHidden(index)}
            isOpen={openIndex === index}
            isSelected={isRowSelected(index)}
            isStretchedOnAny={isStretchedOnAny(index)}
            key={index}
            mixedKeys={getMixedKeys(index)}
            onChange={(next): void => onChange(index, next)}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onFieldScrub={(field, min, value): void => onFieldScrub(index, field, min, value)}
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
