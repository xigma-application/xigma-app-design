import cx from 'classnames';
import { FC, Ref } from 'react';

// @xigma
import { Icon } from '@xigma/components';

// components
import StrokeBrushPreview from '../StrokeBrushPreview/StrokeBrushPreview';

// others
import { getBrushById } from '../utils/getBrushById';
import { STROKE_BRUSH_TRIGGER_PREVIEW_HEIGHT_PX } from '../constants';
import { getBrushImageUrl } from 'utils/brushes/getBrushImageUrl';

// styles
import styles from './stroke-brush-trigger.module.scss';

export type TStrokeBrushTriggerProps = {
  ariaLabel: string;
  brushId: string | undefined;
  brushLabel: string;
  isOpen: boolean;
  onClick: TFunc;
  ref?: Ref<HTMLButtonElement>;
};

export const StrokeBrushTrigger: FC<TStrokeBrushTriggerProps> = ({ ariaLabel, brushId, brushLabel, isOpen, onClick, ref }) => {
  const brush = brushId === undefined ? undefined : getBrushById(brushId);

  return (
    <button
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      className={cx(styles.StrokeBrushTrigger, { [styles['StrokeBrushTrigger--open']]: isOpen })}
      onClick={onClick}
      ref={ref}
      type="button"
    >
      <span className={styles.StrokeBrushTrigger__preview} style={{ height: STROKE_BRUSH_TRIGGER_PREVIEW_HEIGHT_PX }}>
        {brush ? (
          <StrokeBrushPreview label={brushLabel} src={getBrushImageUrl(brush.imageFile)} />
        ) : (
          <span className={styles.StrokeBrushTrigger__label}>{brushLabel}</span>
        )}
      </span>
      <Icon name="ChevronDown" size={24} />
    </button>
  );
};

export default StrokeBrushTrigger;
