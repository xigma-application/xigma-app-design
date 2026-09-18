// others
import { IMAGE_FILL_DEFAULT_TILE_SCALE } from 'constant/canvas';

// store
import { AppDispatch } from 'store';
import { setImageEditor } from 'store/design/slice';
import { TImageEditorState } from 'store/design/types';

// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageCrop, TImagePaint, TVideoPaint } from 'types/design/paint/types';
import { TPoint, TResizeHandle } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { armImageTileScaleDrag } from '../../armImageTileScaleDrag';
import { getImageCropResizeHandleAtPoint } from 'components/Design/Canvas/utils/getImageCropResizeHandleAtPoint';
import { getImageTileRect } from 'components/Design/Canvas/utils/getImageTileRect';
import { getResizeHandleAtPoint } from 'components/Design/Canvas/utils/getResizeHandleAtPoint/getResizeHandleAtPoint';
import { getRotateHandleAtPoint } from 'components/Design/Canvas/utils/getRotateHandleAtPoint';

const getScaleAnchorPoint = (handle: TResizeHandle, rect: TImageCrop): TPoint => {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  switch (handle) {
    case 'ne':
      return { x: rect.x, y: rect.y + rect.height };
    case 'nw':
      return { x: rect.x + rect.width, y: rect.y + rect.height };
    case 'sw':
      return { x: rect.x + rect.width, y: rect.y };
    case 'se':
      return { x: rect.x, y: rect.y };
    case 'n':
      return { x: centerX, y: rect.y + rect.height };
    case 's':
      return { x: centerX, y: rect.y };
    case 'e':
      return { x: rect.x, y: centerY };
    default:
      return { x: rect.x + rect.width, y: centerY };
  }
};

export const armImageTileScaleOnPointerDown = (
  canvas: HTMLCanvasElement,
  canvasRefs: TCanvasRefs,
  dispatch: AppDispatch,
  event: PointerEvent,
  hit: TSceneNode | null,
  point: TPoint,
  viewport: TViewport,
  imageEditor: TImageEditorState,
  node: TAppearanceNode,
  paint: TImagePaint | TVideoPaint,
): true | undefined => {
  const tileRect = node.rotation === 0 ? getImageTileRect(node, paint) : undefined;
  const tileHandle = tileRect ? getImageCropResizeHandleAtPoint(point, tileRect, viewport) : null;

  if (tileRect && tileHandle) {
    const anchor = getScaleAnchorPoint(tileHandle, tileRect);
    const startDistance = Math.hypot(point.x - anchor.x, point.y - anchor.y);

    armImageTileScaleDrag(
      canvas,
      event,
      canvasRefs.imageCrop.imageTileScaleDragRef,
      node.id,
      imageEditor.paintIndex,
      anchor,
      startDistance,
      paint.scale ?? IMAGE_FILL_DEFAULT_TILE_SCALE,
    );

    return true;
  }

  switch (true) {
    case hit?.id === node.id:
    case Boolean(getResizeHandleAtPoint(point, [node], viewport)):
    case Boolean(getRotateHandleAtPoint(point, [node], viewport)):
      return undefined;
    default:
      dispatch(setImageEditor(null));
      return true;
  }
};
