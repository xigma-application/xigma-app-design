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
import { getEditedPaintIndex } from 'components/Design/Canvas/utils/getEditedPaintIndex';
import { getStrokesCacheKey } from 'components/Design/Canvas/utils/getStrokesCacheKey';
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

type TResizedGeometry = { height: number; origin: TBoxResizeOrigin; scaleX: number; scaleY: number; width: number; x: number; y: number };

const getResizedPaints = (
  paints: TPaint[],
  cacheKey: string,
  editedPaintIndex: number | null,
  { height, origin, scaleX, scaleY, width, x, y }: TResizedGeometry,
): TPaint[] | undefined => {
  const originalPaints = getResizeOriginalFills(cacheKey, paints);

  if (originalPaints.some(isMirrorableFill)) {
    const mirroredPaints = getMirroredFills(originalPaints, scaleX, scaleY, editedPaintIndex);

    return (
      scaleFillsCrop(
        mirroredPaints,
        {
          newCenterX: x + width / 2,
          newCenterY: y + height / 2,
          oldCenterX: origin.x + origin.width / 2,
          oldCenterY: origin.y + origin.height / 2,
          scaleX: origin.width !== 0 ? width / origin.width : 1,
          scaleY: origin.height !== 0 ? height / origin.height : 1,
        },
        editedPaintIndex,
      ) ?? mirroredPaints
    );
  }
};

const getResizedBoxPaintChanges = (
  node: TSceneNode | undefined,
  id: string,
  geometry: TResizedGeometry,
): { fills?: TPaint[]; strokes?: TPaint[] } => {
  if (node && isAppearanceNode(node)) {
    const imageEditor = selectImageEditor(store.getState());
    const editedImageEditor = imageEditor?.mode === 'crop' && imageEditor.nodeId === id ? imageEditor : null;
    const fills = getResizedPaints(node.fills, id, getEditedPaintIndex(editedImageEditor, 'fills'), geometry);
    const strokes = node.strokes
      ? getResizedPaints(node.strokes, getStrokesCacheKey(id), getEditedPaintIndex(editedImageEditor, 'strokes'), geometry)
      : undefined;

    return { ...(fills ? { fills } : {}), ...(strokes ? { strokes } : {}) };
  }

  return {};
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
  const paintChanges = getResizedBoxPaintChanges(node, id, { height, origin, scaleX, scaleY, width, x, y });

  dispatch(updateNode({ changes: { ...changes, ...sizingModeChanges, ...paintChanges }, id }));
};
