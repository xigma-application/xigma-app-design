import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { TUseImagePanelResult } from '../hooks/useImagePanel';

// others
import { ADJUSTMENT_SLIDER_MAX, ADJUSTMENT_SLIDER_MIN, translationNameSpace } from '../constants';

// styles
import styles from './image-adjustment-sliders.module.scss';

export type TImageAdjustmentSlidersProps = { imagePanel: TUseImagePanelResult };

export const ImageAdjustmentSliders: FC<TImageAdjustmentSlidersProps> = ({ imagePanel }) => {
  const { t } = useTranslation();
  const {
    contrast,
    exposure,
    highlights,
    saturation,
    setContrast,
    setExposure,
    setHighlights,
    setSaturation,
    setShadows,
    setTemperature,
    setTint,
    shadows,
    temperature,
    tint,
  } = imagePanel;
  const rows: { id: string; label: string; onChange: TFunc<[number]>; value: number }[] = [
    { id: 'exposure', label: t(`${translationNameSpace}.exposureLabel`), onChange: setExposure, value: exposure },
    { id: 'contrast', label: t(`${translationNameSpace}.contrastLabel`), onChange: setContrast, value: contrast },
    { id: 'saturation', label: t(`${translationNameSpace}.saturationLabel`), onChange: setSaturation, value: saturation },
    { id: 'temperature', label: t(`${translationNameSpace}.temperatureLabel`), onChange: setTemperature, value: temperature },
    { id: 'tint', label: t(`${translationNameSpace}.tintLabel`), onChange: setTint, value: tint },
    { id: 'highlights', label: t(`${translationNameSpace}.highlightsLabel`), onChange: setHighlights, value: highlights },
    { id: 'shadows', label: t(`${translationNameSpace}.shadowsLabel`), onChange: setShadows, value: shadows },
  ];

  return (
    <div className={styles.ImageAdjustmentSliders}>
      {rows.map((row) => (
        <div className={styles.ImageAdjustmentSliders__row} key={row.id}>
          <span className={styles.ImageAdjustmentSliders__label}>{row.label}</span>
          <UITools.Slider
            ariaLabel={row.label}
            baseValue={0}
            max={ADJUSTMENT_SLIDER_MAX}
            min={ADJUSTMENT_SLIDER_MIN}
            onChange={row.onChange}
            value={row.value}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageAdjustmentSliders;
