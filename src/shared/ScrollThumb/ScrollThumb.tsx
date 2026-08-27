import cx from 'classnames';
import { FC, RefObject } from 'react';

// hooks
import { useScrollThumb } from 'hooks';

// styles
import styles from './scroll-thumb.module.scss';

export type TScrollThumbProps = { className?: string; scrollRef: RefObject<HTMLDivElement | null> };

export const ScrollThumb: FC<TScrollThumbProps> = ({ className = '', scrollRef }) => {
  const { onPointerDown, onPointerMove, onPointerUp, thumbHeightRatio, thumbTopRatio } = useScrollThumb(scrollRef);

  return thumbHeightRatio < 1 ? (
    <div
      className={cx(styles.ScrollThumb, className)}
      data-no-drag
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ height: `${thumbHeightRatio * 100}%`, top: `${thumbTopRatio * (100 - thumbHeightRatio * 100)}%` }}
    />
  ) : null;
};

export default ScrollThumb;
