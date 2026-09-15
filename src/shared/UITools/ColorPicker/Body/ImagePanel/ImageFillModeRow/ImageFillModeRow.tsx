import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { UITools } from 'shared';

// styles
import styles from './image-fill-mode-row.module.scss';

// types
import { TImageFillMode } from '../types';

// utils
import { buildFillModeOptions } from '../utils/buildFillModeOptions';

export type TImageFillModeRowProps = { fillMode: TImageFillMode; setFillMode: TFunc<[TImageFillMode]> };

export const ImageFillModeRow: FC<TImageFillModeRowProps> = ({ fillMode, setFillMode }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.ImageFillModeRow}>
      <UITools.Dropdown
        className={styles.ImageFillModeRow__dropdown}
        onSelect={setFillMode}
        options={buildFillModeOptions(t)}
        value={fillMode}
        variant="outline"
      />
      <UITools.Button
        ariaLabel={t('colorPicker.image.rotateAriaLabel')}
        color="secondary"
        size="small"
        style={{ padding: 0 }}
        variant="outline"
      >
        <Icon name="ToggleRotate" size={24} />
      </UITools.Button>
    </div>
  );
};

export default ImageFillModeRow;
