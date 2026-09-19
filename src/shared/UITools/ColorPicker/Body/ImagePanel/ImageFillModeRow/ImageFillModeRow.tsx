import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { Tooltip, UITools } from 'shared';
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';

// styles
import styles from './image-fill-mode-row.module.scss';

// types
import { TextFieldVariant } from 'shared/UITools/TextField/enums';
import { TImageFillMode } from '../types';

// utils
import { buildFillModeOptions } from '../utils/buildFillModeOptions';
import { useCommitTileScalePercent } from './hooks/useCommitTileScalePercent';

export type TImageFillModeRowProps = {
  fillMode: TImageFillMode;
  onRotate?: TFunc;
  onTileScaleChange?: TFunc<[number]>;
  setFillMode: TFunc<[TImageFillMode]>;
  tileScale?: number;
};

export const ImageFillModeRow: FC<TImageFillModeRowProps> = ({ fillMode, onRotate, onTileScaleChange, setFillMode, tileScale = 1 }) => {
  const { t } = useTranslation();
  const percent = Math.round(tileScale * 100);
  const commitTileScalePercent = useCommitTileScalePercent(onTileScaleChange);

  return (
    <div className={styles.ImageFillModeRow}>
      <div className={styles.ImageFillModeRow__fields}>
        <UITools.Dropdown
          className={styles.ImageFillModeRow__dropdown}
          onSelect={setFillMode}
          options={buildFillModeOptions(t)}
          value={fillMode}
          variant="outline"
        />
        {fillMode === 'tile' && (
          <TextFieldWrapper
            aria-label={t('colorPicker.image.tileScaleAriaLabel')}
            className={styles.ImageFillModeRow__scale}
            defaultValue={`${percent}%`}
            onBlur={commitTileScalePercent}
            stepNumbers={{ min: 1 }}
            type="text"
            variant={TextFieldVariant.outlined}
          />
        )}
      </div>
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
