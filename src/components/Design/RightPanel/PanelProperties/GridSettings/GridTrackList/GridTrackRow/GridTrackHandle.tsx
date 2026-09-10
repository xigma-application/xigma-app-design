import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './grid-track-handle.module.scss';

export type TGridTrackHandleProps = {
  index: number;
  isDragging: boolean;
  isSelected: boolean;
  onPointerDown: TFunc<[ReactPointerEvent]>;
};

export const GridTrackHandle: FC<TGridTrackHandleProps> = ({ index, isDragging, isSelected, onPointerDown }) => {
  const { t } = useTranslation();

  return (
    <button
      aria-label={t(`${translationNameSpace}.reorderAriaLabel`)}
      className={cx(styles.GridTrackHandle, {
        [styles['GridTrackHandle--dragging']]: isDragging,
        [styles['GridTrackHandle--selected']]: isSelected,
      })}
      onPointerDown={onPointerDown}
      type="button"
    >
      <span className={styles.GridTrackHandle__number}>{index + 1}</span>
      <Icon className={styles.GridTrackHandle__grabber} color="neutral2" name="RowGrabber" size={8} />
    </button>
  );
};

export default GridTrackHandle;
