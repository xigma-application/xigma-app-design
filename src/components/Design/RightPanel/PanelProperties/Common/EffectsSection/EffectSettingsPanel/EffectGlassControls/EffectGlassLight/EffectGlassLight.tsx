import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';
import GlassSpace from '@xigma/assets/glass-space.svg?react';

// hooks
import { useGlassLightDrag } from './hooks/useGlassLightDrag/useGlassLightDrag';

// others
import { translationNameSpace } from '../../../constants';

// styles
import styles from './effect-glass-light.module.scss';

// utils
import { getGlassLightPosition } from './utils/getGlassLightPosition';
import { getGlassLightRotation } from './utils/getGlassLightRotation';

export type TEffectGlassLightProps = {
  angle: number;
  intensity: number;
  onChange: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
};

export const EffectGlassLight: FC<TEffectGlassLightProps> = ({ angle, intensity, onChange, onDragEnd, onDragStart }) => {
  const { t } = useTranslation();
  const { onPointerDown, onPointerMove, onPointerUp, ref } = useGlassLightDrag({ onChange, onDragEnd, onDragStart });
  const position = getGlassLightPosition(angle);

  return (
    <div
      aria-label={t(`${translationNameSpace}.settings.fields.lightDirection`)}
      aria-valuemax={180}
      aria-valuemin={-180}
      aria-valuenow={angle}
      className={styles.EffectGlassLight}
      data-no-drag
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={ref}
      role="slider"
      tabIndex={0}
    >
      <div className={styles.EffectGlassLight__glassWrapper}>
        <GlassSpace className={styles.EffectGlassLight__glass} style={{ opacity: intensity / 100, transform: `rotate(${angle}deg)` }} />
        <span
          className={styles.EffectGlassLight__light}
          style={{
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`,
            transform: `translate(-50%, -50%) rotate(${getGlassLightRotation(angle)}deg)`,
          }}
        >
          <Icon color="blue2" name="Light" size={24} />
        </span>
      </div>
      <span className={styles.EffectGlassLight__marker} />
    </div>
  );
};

export default EffectGlassLight;
