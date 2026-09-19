import cx from 'classnames';
import { FC, useRef } from 'react';

// components
import StrokeBrushOption from './StrokeBrushOption/StrokeBrushOption';

// hooks
import { useIsHeaderStuck } from './hooks/useIsHeaderStuck/useIsHeaderStuck';

// others
import { STROKE_BRUSH_CATEGORY_HEADER_HEIGHT_PX } from '../constants';

// styles
import styles from './stroke-brush-category-section.module.scss';

// types
import { TBrushCategory } from '@xigma/utils';

export type TStrokeBrushCategorySectionProps = {
  category: TBrushCategory;
  getBrushLabel: (translationKey: string) => string;
  getCategoryLabel: (translationKey: string) => string;
  onHoverEnd: TFunc;
  onHoverStart: TFunc<[string]>;
  onSelect: TFunc<[string]>;
  selectedBrushId: string;
};

export const StrokeBrushCategorySection: FC<TStrokeBrushCategorySectionProps> = ({
  category,
  getBrushLabel,
  getCategoryLabel,
  onHoverEnd,
  onHoverStart,
  onSelect,
  selectedBrushId,
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const isStuck = useIsHeaderStuck(headerRef);

  return (
    <div className={styles.StrokeBrushCategorySection}>
      <div
        className={cx(styles.StrokeBrushCategorySection__header, { [styles['StrokeBrushCategorySection__header--stuck']]: isStuck })}
        ref={headerRef}
        style={{ height: STROKE_BRUSH_CATEGORY_HEADER_HEIGHT_PX }}
      >
        {getCategoryLabel(category.labelTranslationKey)}
      </div>
      {category.brushes.map((brush) => (
        <StrokeBrushOption
          brush={brush}
          key={brush.id}
          label={getBrushLabel(brush.labelTranslationKey)}
          onClick={() => onSelect(brush.id)}
          onMouseEnter={() => onHoverStart(brush.id)}
          onMouseLeave={onHoverEnd}
          selected={brush.id === selectedBrushId}
        />
      ))}
    </div>
  );
};

export default StrokeBrushCategorySection;
