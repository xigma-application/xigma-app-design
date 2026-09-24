// store
import { AppDispatch, store } from 'store';
import { selectNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TFlipAxis } from './types';
import { TPoint } from 'types/canvas';

// utils
import { flipFrameContent } from './flipFrameContent';
import { getFlippedFrameSettings } from './getFlippedFrameSettings';
import { getMirroredPosition } from './getMirroredPosition';

export const flipFrameTree = (dispatch: AppDispatch, frameId: string, axis: TFlipAxis, mirrorCenter: TPoint | null): void => {
  const frame = selectNodes(store.getState())[frameId];

  if (frame?.type === NodeType.frame) {
    dispatch(
      updateNode({ changes: { ...getFlippedFrameSettings(frame, axis), ...getMirroredPosition(frame, axis, mirrorCenter) }, id: frameId }),
    );
    flipFrameContent(dispatch, frameId, axis, flipFrameTree);
  }
};
