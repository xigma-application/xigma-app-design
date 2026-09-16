import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { Tooltip, UITools } from 'shared';

// styles
import styles from './image-fill-mode-row.module.scss';

// types
import { TImageFillMode } from '../types';

// utils
import { buildFillModeOptions } from '../utils/buildFillModeOptions';

export type TImageFillModeRowProps = { fillMode: TImageFillMode; onRotate?: TFunc; setFillMode: TFunc<[TImageFillMode]> };

export const ImageFillModeRow: FC<TImageFillModeRowProps> = ({ fillMode, onRotate, setFillMode }) => {
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
      <Tooltip content={t('colorPicker.image.rotateTooltip')}>
        <UITools.Button
          ariaLabel={t('colorPicker.image.rotateAriaLabel')}
          color="secondary"
          onClick={onRotate}
          size="small"
          style={{ padding: 0 }}
          variant="outline"
        >
          <Icon name="ToggleRotate" size={24} />
        </UITools.Button>
      </Tooltip>
    </div>
  );
};

export default ImageFillModeRow;
