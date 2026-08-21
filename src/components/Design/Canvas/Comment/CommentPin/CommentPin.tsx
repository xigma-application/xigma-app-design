import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// hooks
import { useCommentPinHover } from './hooks/useCommentPinHover';

// styles
import styles from './comment-pin.module.scss';

// types
import { TComment } from 'types/design/types';

// utils
import { getLastDateLabel } from 'utils/date/getLastDateLabel';

export type TCommentPinProps = {
  comment: TComment;
  x: number;
  y: number;
};

const CommentPin: FC<TCommentPinProps> = ({ comment, x, y }) => {
  const { onMouseEnter, onMouseLeave, visible } = useCommentPinHover();
  const { t } = useTranslation();
  const lastDateLabel = getLastDateLabel(comment.createdAt, t);

  return (
    <div
      className={cx(styles.CommentPin, {
        [styles['CommentPin--visible']]: visible,
      })}
      style={{ left: x, top: y }}
    >
      <div
        className={cx(styles.CommentPin__wrapper, {
          [styles['CommentPin__wrapper--visible']]: visible,
        })}
        onMouseLeave={onMouseLeave}
      >
        <div className={styles['CommentPin__icon-wrapper']} onMouseEnter={onMouseEnter}>
          <div className={styles.CommentPin__author}>{comment.author.charAt(0)}</div>
        </div>
        <div className={styles.CommentPin__content}>
          <div className={styles['CommentPin__content-header']}>
            <div className={styles['CommentPin__author-name']}>{comment.author}</div>
            <div className={styles['CommentPin__last-date']}>{lastDateLabel}</div>
          </div>
          <div className={styles['CommentPin__content-text']}>{comment.content}</div>
        </div>
      </div>
    </div>
  );
};

export default CommentPin;
