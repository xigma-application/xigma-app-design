import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { GRADIENT_TYPE_LABEL_KEY, GRADIENT_TYPE_ORDER } from '../constants';

// styles
import styles from './gradient-actions.module.scss';

// types
import { TGradientType } from '../types';

export type TGradientActionsProps = { onFlip: TFunc; onRotate: TFunc; onTypeChange: TFunc<[TGradientType]>; type: TGradientType };

export const GradientActions: FC<TGradientActionsProps> = ({ onFlip, onRotate, onTypeChange, type }) => {
  const { t } = useTranslation();
  const typeOptions = GRADIENT_TYPE_ORDER.map((option) => ({ label: t(GRADIENT_TYPE_LABEL_KEY[option]), value: option }));

  return (
    <div className={styles.GradientActions}>
      <UITools.Dropdown
        className={styles['GradientActions__type-dropdown']}
        onSelect={onTypeChange}
        options={typeOptions}
        value={type}
        variant="outline"
      />
      <div className={styles.GradientActions__buttons}>
        <Tooltip content={t('colorPicker.gradient.actions.flip')}>
          <UITools.ButtonIcon ariaLabel={t('colorPicker.gradient.actions.flip')} name="SwapHorizontal" onClick={onFlip} />
        </Tooltip>
        <Tooltip content={t('colorPicker.gradient.actions.rotate')}>
          <UITools.ButtonIcon ariaLabel={t('colorPicker.gradient.actions.rotate')} name="ToggleRotate" onClick={onRotate} />
        </Tooltip>
      </div>
    </div>
  );
};

export default GradientActions;
