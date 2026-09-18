// store
import { selectImageEditor, selectNodes } from 'store/design/selectors';
import { getAutoLayoutSizingModeResetChanges } from 'store/design/utils/autoLayout/getAutoLayoutSizingModeResetChanges';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TImagePaint, TPaint, TPatternPaint, TVideoPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TResizeNodeOrigin, TVectorNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { clampAutoLayoutSize } from 'store/design/utils/autoLayout/clampAutoLayoutSize';
import { getResizeAxisScale } from './getResizeAxisScale';
import { getResizeChanges } from './getResizeChanges';
import { getResizedPosition } from './getResizedPosition';
import { getResizeOriginalFills } from './resizeOriginalFillsCache';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { scaleFillsCrop } from 'components/Design/Canvas/utils/scaleFillsCrop';

type TBoxResizeOrigin = Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number } | TVectorNodeOrigin>;

const isMirrorableFill = (fill: TPaint): fill is TImagePaint | TPatternPaint | TVideoPaint =>
  fill.type === 'image' || fill.type === 'pattern' || fill.type === 'video';

const getMirroredFills = (fills: TPaint[], scaleX: number, scaleY: number, skipIndex: number | null): TPaint[] =>
  scaleX < 0 || scaleY < 0
    ? fills.map((fill, index) =>
        isMirrorableFill(fill) && index !== skipIndex
          ? { ...fill, flipX: scaleX < 0 ? !fill.flipX : fill.flipX, flipY: scaleY < 0 ? !fill.flipY : fill.flipY }
          : fill,
      )
    : fills;

const getResizedBoxFills = (
  node: TSceneNode | undefined,
  id: string,
  origin: TBoxResizeOrigin,
  x: number,
  y: number,
  width: number,
  height: number,
  scaleX: number,
  scaleY: number,
): TPaint[] | undefined => {
  if (node && isAppearanceNode(node)) {
    const originalFills = getResizeOriginalFills(id, node.fills);

    if (originalFills.some(isMirrorableFill)) {
      const imageEditor = selectImageEditor(store.getState());
      const editedPaintIndex = imageEditor?.mode === 'crop' && imageEditor.nodeId === id ? imageEditor.paintIndex : null;
      const mirroredFills = getMirroredFills(originalFills, scaleX, scaleY, editedPaintIndex);

      return (
        scaleFillsCrop(
          mirroredFills,
          {
            newCenterX: x + width / 2,
            newCenterY: y + height / 2,
            oldCenterX: origin.x + origin.width / 2,
            oldCenterY: origin.y + origin.height / 2,
            scaleX: origin.width !== 0 ? width / origin.width : 1,
            scaleY: origin.height !== 0 ? height / origin.height : 1,
          },
          editedPaintIndex,
        ) ?? mirroredFills
      );
    }
  }
};

export const resizeBoxNode = (
  id: string,
  origin: TBoxResizeOrigin,
  dispatch: AppDispatch,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
  isSingleBoxOrigin: boolean,
  rotatedAnchorSolver: ((width: number, height: number) => TPoint) | null,
): void => {
  const axisScale = getResizeAxisScale(scaleX, scaleY, origin.rotation, isSingleBoxOrigin);
  const node = selectNodes(store.getState())[id];
  const rawHeight = Math.round(origin.height * axisScale.y);
  const rawWidth = Math.round(origin.width * axisScale.x);
  const height = node && isBoxSceneNode(node) ? clampAutoLayoutSize(rawHeight, node.minHeight, node.maxHeight) : rawHeight;
  const width = node && isBoxSceneNode(node) ? clampAutoLayoutSize(rawWidth, node.minWidth, node.maxWidth) : rawWidth;
  const { x, y } = getResizedPosition(origin, anchors, scaleX, scaleY, width, height, rotatedAnchorSolver);
  const changes = getResizeChanges(origin, scaleX, scaleY, isSingleBoxOrigin, height, width, x, y);
  const sizingModeChanges = node ? getAutoLayoutSizingModeResetChanges(node, width !== origin.width, height !== origin.height) : {};
  const fills = getResizedBoxFills(node, id, origin, x, y, width, height, scaleX, scaleY);

  dispatch(updateNode({ changes: fills ? { ...changes, ...sizingModeChanges, fills } : { ...changes, ...sizingModeChanges }, id }));
};
