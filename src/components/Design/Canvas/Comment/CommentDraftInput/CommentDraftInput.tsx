import cx from 'classnames';
import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// components
import CommentDraftFooter from './CommentDraftFooter/CommentDraftFooter';

// hooks
import { useCommentDraftAutoFocus } from './hooks/useCommentDraftAutoFocus';
import { useCommentDraftEntrance } from './hooks/useCommentDraftEntrance';
import { useCommentDraftKeyDown } from './hooks/useCommentDraftKeyDown';
import { useCommentDraftOutsideDismissal } from './hooks/useCommentDraftOutsideDismissal';
import { useCommentDraftValue } from './hooks/useCommentDraftValue';
import { useSubmitCommentDraft } from './hooks/useSubmitCommentDraft';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './comment-draft-input.module.scss';

export type TCommentDraftInputProps = {
  x: number;
  y: number;
};

const CommentDraftInput: FC<TCommentDraftInputProps> = ({ x, y }) => {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const { onInput, value } = useCommentDraftValue();
  const { onClick } = useSubmitCommentDraft(value);
  const { animationActive, onFocus } = useCommentDraftOutsideDismissal(rootRef, value);
  const entering = useCommentDraftEntrance();
  const onKeyDown = useCommentDraftKeyDown(onClick);

  useCommentDraftAutoFocus(inputRef, entering);

  return (
    <div className={styles.CommentDraftInput} ref={rootRef} style={{ left: x, top: y - 32 }}>
      <div className={styles.CommentDraftInput__pin} />
      <div
        className={cx(styles.CommentDraftInput__content, {
          [styles['CommentDraftInput__content--active']]: Boolean(value),
          [styles['CommentDraftInput__content--animation']]: animationActive,
          [styles['CommentDraftInput__content--entering']]: entering,
        })}
      >
        <div
          className={styles.CommentDraftInput__input}
          contentEditable
          onFocus={onFocus}
          onInput={onInput}
          onKeyDown={onKeyDown}
          ref={inputRef}
          suppressContentEditableWarning
        />
        {!value && <span className={styles.CommentDraftInput__placeholder}>{t(`${translationNameSpace}.placeholder`)}</span>}
        {Boolean(value) && <div className={styles.CommentDraftInput__separator} />}
        <CommentDraftFooter value={value} />
      </div>
    </div>
  );
};

export default CommentDraftInput;
