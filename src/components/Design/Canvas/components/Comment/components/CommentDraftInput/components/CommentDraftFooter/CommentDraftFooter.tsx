import cx from 'classnames';
import { FC } from 'react';

// hooks
import { useSubmitCommentDraft } from '../../hooks/useSubmitCommentDraft';

// shared
import Icon from 'shared/UI/Icon/Icon';

// styles
import styles from './comment-draft-footer.module.scss';

export type TCommentDraftFooterProps = {
  value: string;
};

const CommentDraftFooter: FC<TCommentDraftFooterProps> = ({ value }) => {
  const { onClick, onMouseDown } = useSubmitCommentDraft(value);

  return (
    <div className={styles.CommentDraftFooter}>
      <button
        className={cx(styles.CommentDraftFooter__button, { [styles['CommentDraftFooter__button--active']]: Boolean(value) })}
        onClick={onClick}
        onMouseDown={onMouseDown}
        type="button"
      >
        <Icon color={value ? 'onBlue1' : 'neutral5'} name="ArrowUp" size={24} />
      </button>
    </div>
  );
};

export default CommentDraftFooter;
