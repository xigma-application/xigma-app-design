import { FC } from 'react';

// components
import StrokeBrushOption from './StrokeBrushOption/StrokeBrushOption';

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
}) => (
  <div className={styles.StrokeBrushCategorySection}>
    <div className={styles.StrokeBrushCategorySection__header} style={{ height: STROKE_BRUSH_CATEGORY_HEADER_HEIGHT_PX }}>
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

export default StrokeBrushCategorySection;
