import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './effect-blur-mode-toggle.module.scss';

// types
import { EffectBlurType } from 'types/design/enums';

export type TEffectBlurModeToggleProps = {
  blurType?: EffectBlurType;
  onChange: TFunc<[EffectBlurType]>;
};

export const EffectBlurModeToggle: FC<TEffectBlurModeToggleProps> = ({ blurType, onChange }) => {
  const { t } = useTranslation();

  return (
    <UITools.ToggleButtonGroup
      className={styles.EffectBlurModeToggle}
      e2eValue="effect-blur-mode"
      onChange={(value): void => onChange(value as EffectBlurType)}
      toggleButtons={[
        { label: t(`${translationNameSpace}.settings.blurMode.uniform`), value: EffectBlurType.uniform },
        { label: t(`${translationNameSpace}.settings.blurMode.progressive`), value: EffectBlurType.progressive },
      ]}
      value={blurType ?? ''}
    />
  );
};

export default EffectBlurModeToggle;
