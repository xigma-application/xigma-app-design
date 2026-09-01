import cx from 'classnames';
import { FC, RefObject } from 'react';

// hooks
import { useScrollThumb } from 'hooks';

// styles
import styles from './scroll-thumb.module.scss';

// types
import { TScrollThumbOrientation } from './types';

// utils
import { getThumbStyle } from './utils/getThumbStyle';

export type TScrollThumbProps = {
  className?: string;
  orientation?: TScrollThumbOrientation;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export const ScrollThumb: FC<TScrollThumbProps> = ({ className = '', orientation = 'vertical', scrollRef }) => {
  const { onPointerDown, onPointerMove, onPointerUp, thumbSizeRatio, thumbStartRatio } = useScrollThumb(
    scrollRef,
    orientation === 'horizontal' ? 'x' : 'y',
  );

  return thumbSizeRatio < 1 ? (
    <div
      className={cx(styles.ScrollThumb, orientation === 'horizontal' && styles['ScrollThumb--horizontal'], className)}
      data-no-drag
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={getThumbStyle(orientation, thumbSizeRatio, thumbStartRatio)}
    />
  ) : null;
};

export default ScrollThumb;
