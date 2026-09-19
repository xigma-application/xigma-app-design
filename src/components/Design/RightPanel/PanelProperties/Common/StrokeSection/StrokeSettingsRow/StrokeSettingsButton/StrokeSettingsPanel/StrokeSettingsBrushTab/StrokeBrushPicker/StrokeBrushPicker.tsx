import { FC, Ref } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// components
import StrokeBrushCategorySection from './StrokeBrushCategorySection/StrokeBrushCategorySection';
import StrokeSettingsPanelHeader from '../../StrokeSettingsPanelHeader/StrokeSettingsPanelHeader';

// others
import { STROKE_BRUSH_PICKER_HEIGHT_PX, STROKE_BRUSH_PICKER_WIDTH_PX } from './constants';
import { translationNameSpace } from '../../../../../constants';

// styles
import styles from './stroke-brush-picker.module.scss';

export type TStrokeBrushPickerProps = {
  onClose: TFunc;
  onOptionHoverEnd: TFunc;
  onOptionHoverStart: TFunc<[string]>;
  onSelect: TFunc<[string]>;
  ref?: Ref<HTMLDivElement>;
  selectedBrushId: string;
};

export const StrokeBrushPicker: FC<TStrokeBrushPickerProps> = ({
  onClose,
  onOptionHoverEnd,
  onOptionHoverStart,
  onSelect,
  ref,
  selectedBrushId,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={styles.StrokeBrushPicker}
      ref={ref}
      style={{ height: STROKE_BRUSH_PICKER_HEIGHT_PX, width: STROKE_BRUSH_PICKER_WIDTH_PX }}
    >
      <StrokeSettingsPanelHeader onClose={onClose} title={t(`${translationNameSpace}.settings.brush.pickerTitle`)} />
      <div className={styles.StrokeBrushPicker__list}>
        {BRUSH_CATEGORIES.map((category) => (
          <StrokeBrushCategorySection
            category={category}
            getBrushLabel={(key) => t(key)}
            getCategoryLabel={(key) => t(key)}
            key={category.id}
            onHoverEnd={onOptionHoverEnd}
            onHoverStart={onOptionHoverStart}
            onSelect={onSelect}
            selectedBrushId={selectedBrushId}
          />
        ))}
      </div>
    </div>
  );
};

export default StrokeBrushPicker;
