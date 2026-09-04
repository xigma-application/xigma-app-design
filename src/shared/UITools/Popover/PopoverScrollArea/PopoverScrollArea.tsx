import cx from 'classnames';
import { FC, ReactNode, useRef } from 'react';

// @xigma
import { Icon } from '@xigma/components';

// hooks
import { useAutoScroll } from './hooks/useAutoScroll';
import { useScrollEdges } from './hooks/useScrollEdges';

// styles
import styles from './popover-scroll-area.module.scss';

export type TPopoverScrollAreaProps = {
  children: ReactNode;
};

export const PopoverScrollArea: FC<TPopoverScrollAreaProps> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canScrollDown, canScrollUp } = useScrollEdges(scrollRef);
  const { startScrolling, stopScrolling } = useAutoScroll(scrollRef);

  return (
    <div className={styles.PopoverScrollArea}>
      {canScrollUp && (
        <button
          aria-hidden="true"
          className={cx(styles.PopoverScrollArea__edge, styles['PopoverScrollArea__edge--top'])}
          onMouseEnter={(): void => startScrolling('up')}
          onMouseLeave={stopScrolling}
          tabIndex={-1}
          type="button"
        >
          <Icon className={styles.PopoverScrollArea__icon} name="ChevronDown" size={24} />
        </button>
      )}
      <div className={styles.PopoverScrollArea__content} ref={scrollRef}>
        {children}
      </div>
      {canScrollDown && (
        <button
          aria-hidden="true"
          className={cx(styles.PopoverScrollArea__edge, styles['PopoverScrollArea__edge--bottom'])}
          onMouseEnter={(): void => startScrolling('down')}
          onMouseLeave={stopScrolling}
          tabIndex={-1}
          type="button"
        >
          <Icon className={styles.PopoverScrollArea__icon} name="ChevronDown" size={24} />
        </button>
      )}
    </div>
  );
};

export default PopoverScrollArea;
