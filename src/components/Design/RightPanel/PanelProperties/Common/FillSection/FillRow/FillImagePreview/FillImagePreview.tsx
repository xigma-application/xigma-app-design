import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon } from 'shared';

// styles
import styles from './fill-image-preview.module.scss';

// types
import { TImagePaint } from 'types/design/paint/types';

// utils
import { getNonSolidFillSwatchStyle } from '../utils/getNonSolidFillSwatchStyle';
import { translationNameSpace } from '../../constants';

export type TFillImagePreviewProps = {
  isVisible: boolean;
  onToggleVisible: TFunc;
  paint: TImagePaint;
};

export const FillImagePreview: FC<TFillImagePreviewProps> = ({ isVisible, onToggleVisible, paint }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.FillImagePreview}>
      <span className={styles.FillImagePreview__swatch} style={getNonSolidFillSwatchStyle(paint)} />
      <span className={styles.FillImagePreview__label}>{t(`${translationNameSpace}.gradientLabel`)}</span>
      <button
        aria-label={t(`${translationNameSpace}.${isVisible ? 'hideAriaLabel' : 'showAriaLabel'}`)}
        className={styles.FillImagePreview__toggle}
        onClick={onToggleVisible}
        type="button"
      >
        <Icon name={isVisible ? 'EyesOpened' : 'EyesClosed'} size={16} />
      </button>
    </div>
  );
};

export default FillImagePreview;
