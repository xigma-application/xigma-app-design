import { FC } from 'react';

// components
import CommentDraftInput from './CommentDraftInput/CommentDraftInput';
import CommentPin from './CommentPin/CommentPin';

// store
import { selectCommentDraftPosition, selectComments, selectViewport } from 'store/design/selectors';
import { useAppSelector } from 'store';

// utils
import { worldToScreen } from '../utils/worldToScreen';

const Comment: FC = () => {
  const comments = useAppSelector(selectComments);
  const commentDraftPosition = useAppSelector(selectCommentDraftPosition);
  const viewport = useAppSelector(selectViewport);
  const draftScreen = commentDraftPosition ? worldToScreen(commentDraftPosition, viewport) : null;

  return (
    <>
      {comments.map((comment) => {
        const screen = worldToScreen(comment, viewport);
        return <CommentPin comment={comment} key={comment.id} x={screen.x} y={screen.y} />;
      })}
      {draftScreen && <CommentDraftInput x={draftScreen.x} y={draftScreen.y} />}
    </>
  );
};

export default Comment;
