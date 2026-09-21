import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './effect-clip-to-shape-field.module.scss';

export type TEffectClipToShapeFieldProps = {
  onChange: TFunc<[boolean]>;
  value: boolean;
};

export const EffectClipToShapeField: FC<TEffectClipToShapeFieldProps> = ({ onChange, value }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.EffectClipToShapeField}>
      <UITools.Checkbox
        color="secondary"
        e2eValue="effect-clip-to-shape"
        label={t(`${translationNameSpace}.settings.clipToShape`)}
        onChange={onChange}
        value={value}
      />
    </div>
  );
};

export default EffectClipToShapeField;
