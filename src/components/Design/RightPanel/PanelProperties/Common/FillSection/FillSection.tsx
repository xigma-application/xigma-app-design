import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ApplyStylesButton from '../ApplyStylesButton/ApplyStylesButton';
import FillDropIndicator from './FillDropIndicator/FillDropIndicator';
import FillRow from './FillRow/FillRow';
import { UITools } from 'shared';

// hooks
import { useFillSection } from './hooks/useFillSection/useFillSection';

// others
import { getPaintTranslationNamespace } from './constants';

// styles
import styles from './fill-section.module.scss';

// types
import { TPaintProperty } from 'types/design/paint/types';

export type TFillSectionProps = { footer?: ReactNode; property?: TPaintProperty };

export const FillSection: FC<TFillSectionProps> = ({ footer, property = 'fills' }) => {
  const { t } = useTranslation();
  const translationNameSpace = getPaintTranslationNamespace(property);
  const {
    containerRef,
    disabledFillModes,
    dropIndicatorOffset,
    fills,
    isMixed,
    isRowDragging,
    isRowSelected,
    nodeId,
    nodeIds,
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
  } = useFillSection(property);

  return (
    <UITools.Section
      addAriaLabel={t(`${translationNameSpace}.addAriaLabel`)}
      addTooltip={t(`${translationNameSpace}.addTooltip`)}
      component={
        <ApplyStylesButton
          ariaLabel={t(`${translationNameSpace}.applyStylesAriaLabel`)}
          tooltip={t(`${translationNameSpace}.applyStylesTooltip`)}
        />
      }
      e2eValue={property === 'strokes' ? 'stroke' : 'fill'}
      hasContent={fills.length > 0 || isMixed}
      label={t(`${translationNameSpace}.label`)}
      mutedWhenEmpty
      onAdd={onAdd}
    >
      {isMixed && <UITools.SectionHint label={t(`${translationNameSpace}.mixedContent`)} />}
      <div className={styles.FillSection__rows} ref={containerRef}>
        {dropIndicatorOffset !== null && <FillDropIndicator offset={dropIndicatorOffset} />}
        {fills.map((paint, index) => (
          <FillRow
            canDrag={fills.length > 1}
            disabledFillModes={disabledFillModes}
            isDragging={isRowDragging(index)}
            isSelected={isRowSelected(index)}
            key={`${nodeId}-${index}`}
            nodeId={nodeId}
            nodeIds={nodeIds}
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
            property={property}
            registerRow={registerRow(index)}
          />
        ))}
      </div>
      {fills.length > 0 && footer}
    </UITools.Section>
  );
};

export default FillSection;
