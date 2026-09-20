import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from '../EffectBlurModeToggle/effect-blur-mode-toggle.module.scss';

// types
import { EffectNoiseType } from 'types/design/enums';

const NOISE_TYPES = [EffectNoiseType.mono, EffectNoiseType.duo, EffectNoiseType.multi];

export const EffectNoiseTypeToggle: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.ToggleButtonGroup
      className={styles.EffectBlurModeToggle}
      e2eValue="effect-noise-type"
      onChange={(): void => undefined}
      toggleButtons={NOISE_TYPES.map((type) => ({ label: t(`${translationNameSpace}.settings.noiseType.${type}`), value: type }))}
      value={EffectNoiseType.mono}
    />
  );
};

export default EffectNoiseTypeToggle;
