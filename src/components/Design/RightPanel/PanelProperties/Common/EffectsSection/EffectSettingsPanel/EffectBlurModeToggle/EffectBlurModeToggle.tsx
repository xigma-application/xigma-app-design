import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './effect-blur-mode-toggle.module.scss';

const BLUR_MODE_UNIFORM = 'uniform';
const BLUR_MODE_PROGRESSIVE = 'progressive';

export const EffectBlurModeToggle: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.ToggleButtonGroup
      className={styles.EffectBlurModeToggle}
      e2eValue="effect-blur-mode"
      onChange={(): void => undefined}
      toggleButtons={[
        { label: t(`${translationNameSpace}.settings.blurMode.uniform`), value: BLUR_MODE_UNIFORM },
        { label: t(`${translationNameSpace}.settings.blurMode.progressive`), value: BLUR_MODE_PROGRESSIVE },
      ]}
      value={BLUR_MODE_UNIFORM}
    />
  );
};

export default EffectBlurModeToggle;
