import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { ADJUSTMENT_SLIDER_MAX, ADJUSTMENT_SLIDER_MIN, translationNameSpace } from '../constants';
import { DEFAULT_IMAGE_ADJUSTMENTS } from 'constant/canvas';

// styles
import styles from './image-adjustment-sliders.module.scss';

// types
import { TImageAdjustments } from 'types/design/paint/types';

export type TImageAdjustmentSlidersProps = {
  adjustments?: TImageAdjustments;
  onAdjustmentChange?: TFunc<[keyof TImageAdjustments, number]>;
};

export const ImageAdjustmentSliders: FC<TImageAdjustmentSlidersProps> = ({
  adjustments = DEFAULT_IMAGE_ADJUSTMENTS,
  onAdjustmentChange,
}) => {
  const { t } = useTranslation();
  const rows: { id: keyof TImageAdjustments; label: string }[] = [
    { id: 'exposure', label: t(`${translationNameSpace}.exposureLabel`) },
    { id: 'contrast', label: t(`${translationNameSpace}.contrastLabel`) },
    { id: 'saturation', label: t(`${translationNameSpace}.saturationLabel`) },
    { id: 'temperature', label: t(`${translationNameSpace}.temperatureLabel`) },
    { id: 'tint', label: t(`${translationNameSpace}.tintLabel`) },
    { id: 'highlights', label: t(`${translationNameSpace}.highlightsLabel`) },
    { id: 'shadows', label: t(`${translationNameSpace}.shadowsLabel`) },
  ];

  return (
    <div className={styles.ImageAdjustmentSliders}>
      {rows.map((row) => (
        <UITools.Field
          Component={UITools.Slider}
          ariaLabel={row.label}
          baseValue={0}
          controlWidth={128}
          key={row.id}
          label={row.label}
          max={ADJUSTMENT_SLIDER_MAX}
          min={ADJUSTMENT_SLIDER_MIN}
          onChange={(value): void => onAdjustmentChange?.(row.id, value)}
          value={adjustments[row.id]}
        />
      ))}
    </div>
  );
};

export default ImageAdjustmentSliders;
