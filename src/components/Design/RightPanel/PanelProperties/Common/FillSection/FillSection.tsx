import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ApplyStylesButton from './ApplyStylesButton/ApplyStylesButton';
import FillDropIndicator from './FillDropIndicator/FillDropIndicator';
import FillRow from './FillRow/FillRow';
import { UITools } from 'shared';

// hooks
import { useFillSection } from './hooks/useFillSection/useFillSection';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './fill-section.module.scss';

export const FillSection: FC = () => {
  const { t } = useTranslation();
  const {
    containerRef,
    dropIndicatorOffset,
    fills,
    isRowDragging,
    isRowSelected,
    nodeId,
    onAdd,
    onChange,
    onDragEnd,
    onDragStart,
    onPickerOpenChange,
    onRemove,
    onSelectRow,
    onStartDrag,
    onToggleVisible,
    openPickerIndex,
    registerRow,
  } = useFillSection();

  return (
    <UITools.Section
      addAriaLabel={t(`${translationNameSpace}.addAriaLabel`)}
      addTooltip={t(`${translationNameSpace}.addTooltip`)}
      component={<ApplyStylesButton />}
      e2eValue="fill"
      hasContent={fills.length > 0}
      label={t(`${translationNameSpace}.label`)}
      onAdd={onAdd}
    >
      <div className={styles.FillSection__rows} ref={containerRef}>
        {dropIndicatorOffset !== null && <FillDropIndicator offset={dropIndicatorOffset} />}
        {fills.map((paint, index) => (
          <FillRow
            isDragging={isRowDragging(index)}
            isSelected={isRowSelected(index)}
            key={index}
            nodeId={nodeId}
            onChange={(paint): void => onChange(index, paint)}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onPickerOpenChange={(isOpen): void => onPickerOpenChange(index, isOpen)}
            onRemove={(): void => onRemove(index)}
            onSelect={(modifiers): void => onSelectRow(index, modifiers)}
            onStartDrag={(event): void => onStartDrag(index, event)}
            onToggleVisible={(): void => onToggleVisible(index)}
            openPickerIndex={openPickerIndex}
            paint={paint}
            paintIndex={index}
            registerRow={registerRow(index)}
          />
        ))}
      </div>
    </UITools.Section>
  );
};

export default FillSection;
