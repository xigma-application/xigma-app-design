import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useSelectNoiseType } from './hooks/useSelectNoiseType/useSelectNoiseType';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from '../EffectBlurModeToggle/effect-blur-mode-toggle.module.scss';

// types
import { EffectNoiseType } from 'types/design/enums';

const NOISE_TYPES = [EffectNoiseType.mono, EffectNoiseType.duo, EffectNoiseType.multi];

export type TEffectNoiseTypeToggleProps = {
  noiseType?: EffectNoiseType;
  onChange: TFunc<[EffectNoiseType]>;
};

export const EffectNoiseTypeToggle: FC<TEffectNoiseTypeToggleProps> = ({ noiseType = EffectNoiseType.mono, onChange }) => {
  const { t } = useTranslation();
  const onSelect = useSelectNoiseType(onChange);

  return (
    <UITools.ToggleButtonGroup
      className={styles.EffectBlurModeToggle}
      e2eValue="effect-noise-type"
      onChange={onSelect}
      toggleButtons={NOISE_TYPES.map((type) => ({ label: t(`${translationNameSpace}.settings.noiseType.${type}`), value: type }))}
      value={noiseType}
    />
  );
};

export default EffectNoiseTypeToggle;
