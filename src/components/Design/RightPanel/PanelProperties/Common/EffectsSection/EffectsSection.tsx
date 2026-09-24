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

// utils
import { getDisabledBlurTypes } from 'utils/design/effects/getDisabledBlurTypes';

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
    getLayout,
    getMixedKeys,
    isHidden,
    isMixed,
    isRowDragging,
    isRowSelected,
    onAdd,
    onBlendModePreview,
    onChange,
    onDragEnd,
    onDragStart,
    onFieldScrub,
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
          <EffectsMenu disabledTypes={getDisabledBlurTypes(effects)} onSelect={onAdd} />
        </Fragment>
      }
      e2eValue="effects"
      hasContent={effects.length > 0 || isMixed}
      label={t(`${translationNameSpace}.label`)}
      mutedWhenEmpty
    >
      {isMixed && <UITools.SectionHint label={t(`${translationNameSpace}.mixedContent`)} />}
      <div className={styles.EffectsSection__rows} ref={containerRef}>
        {dropIndicatorOffset !== null && <FillDropIndicator offset={dropIndicatorOffset} />}
        {effects.map((effect, index) => (
          <EffectRow
            canDrag={effects.length > 1}
            disabledTypes={getDisabledBlurTypes(effects, index)}
            effect={effect}
            isDragging={isRowDragging(index)}
            isHidden={isHidden(index)}
            isOpen={openIndex === index}
            isSelected={isRowSelected(index)}
            key={index}
            layout={getLayout(index)}
            mixedKeys={getMixedKeys(index)}
            onBlendModePreview={(blendMode): void => onBlendModePreview(index, blendMode)}
            onChange={(next): void => onChange(index, next)}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onFieldScrub={(field, min, value): void => onFieldScrub(index, field, min, value)}
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
