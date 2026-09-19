import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ApplyStylesButton from '../ApplyStylesButton/ApplyStylesButton';
import EffectRow from './EffectRow/EffectRow';
import EffectsMenu from './EffectsMenu/EffectsMenu';
import FillDropIndicator from '../FillSection/FillDropIndicator/FillDropIndicator';
import { UITools } from 'shared';

// hooks
import { useEffectsSection } from './hooks/useEffectsSection/useEffectsSection';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './effects-section.module.scss';

export const EffectsSection: FC = () => {
  const { t } = useTranslation();
  const {
    containerRef,
    dropIndicatorOffset,
    effects,
    isRowDragging,
    isRowSelected,
    onAdd,
    onChange,
    onDragEnd,
    onDragStart,
    onOpenChange,
    onRemove,
    onStartDrag,
    onToggleVisible,
    openIndex,
    registerRow,
  } = useEffectsSection();

  return (
    <UITools.Section
      component={
        <Fragment>
          <ApplyStylesButton
            ariaLabel={t(`${translationNameSpace}.applyStylesAriaLabel`)}
            tooltip={t(`${translationNameSpace}.applyStylesTooltip`)}
          />
          <EffectsMenu onSelect={onAdd} />
        </Fragment>
      }
      e2eValue="effects"
      hasContent={effects.length > 0}
      label={t(`${translationNameSpace}.label`)}
      mutedWhenEmpty
    >
      <div className={styles.EffectsSection__rows} ref={containerRef}>
        {dropIndicatorOffset !== null && <FillDropIndicator offset={dropIndicatorOffset} />}
        {effects.map((effect, index) => (
          <EffectRow
            effect={effect}
            isDragging={isRowDragging(index)}
            isOpen={openIndex === index}
            isSelected={isRowSelected(index)}
            key={index}
            onChange={(next): void => onChange(index, next)}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onOpenChange={(isOpen): void => onOpenChange(index, isOpen)}
            onRemove={(): void => onRemove(index)}
            onStartDrag={(event): void => onStartDrag(index, event)}
            onToggleVisible={(): void => onToggleVisible(index)}
            registerRow={registerRow(index)}
          />
        ))}
      </div>
    </UITools.Section>
  );
};

export default EffectsSection;
