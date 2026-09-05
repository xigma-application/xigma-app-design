import { RefObject } from 'react';

// types
import { NodeType, PathType } from 'types/design/enums';
import { TDraftEntity, TViewport } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { continueAttachArm } from './continueAttachArm';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { previewAttachCursor } from './previewAttachCursor';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { toDraftRect } from '../../../../utils/toDraftRect';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport: TViewport,
  draftRef: RefObject<TDraftEntity | null>,
  startRef: RefObject<TPoint | null>,
  attachTargetIdRef: RefObject<string | null>,
  setClassName: (className: string | null) => void,
): void => {
  if (startRef.current) {
    const current = screenToWorld(getPointerPosition(canvas, event), viewport);

    continueAttachArm(startRef.current, current, viewport, attachTargetIdRef);

    if (!attachTargetIdRef.current) {
      const rect = toDraftRect(startRef.current, current);
      draftRef.current = { ...rect, pathType: PathType.ellipse, type: NodeType.path };
    }
  } else {
    previewAttachCursor(canvas, event, viewport, setClassName);
  }
};
