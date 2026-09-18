// others
import { IMAGE_FILL_DEFAULT_TILE_SCALE } from 'constant/canvas';

// store
import { AppDispatch, store, useAppDispatch, useAppSelector } from 'store';
import { selectImageEditor, selectNodes } from 'store/design/selectors';
import { setImageEditor } from 'store/design/slice';

// types
import { TImageEditorState } from 'store/design/types';
import { TImageFillMode } from 'shared/UITools/ColorPicker/Body/ImagePanel/types';
import { TImagePaint, TPaint, TPaintProperty, TVideoPaint } from 'types/design/paint/types';

// utils
import { seedImageCropIfNeeded } from 'components/Design/Canvas/utils/seedImageCropIfNeeded';

const isImageEditorTargeting = (
  imageEditor: TImageEditorState | null,
  nodeId: string | undefined,
  paintIndex: number,
  property: TPaintProperty,
): imageEditor is TImageEditorState =>
  imageEditor !== null &&
  imageEditor.nodeId === nodeId &&
  imageEditor.paintIndex === paintIndex &&
  (imageEditor.property ?? 'fills') === property;

const applyImageFillModeChange = (
  dispatch: AppDispatch,
  paint: TImagePaint | TVideoPaint,
  onChange: TFunc<[TPaint]>,
  imageEditor: TImageEditorState | null,
  nodeId: string | undefined,
  paintIndex: number,
  property: TPaintProperty,
  fillMode: 'fill' | 'fit',
): void => {
  onChange({ ...paint, crop: undefined, scaleMode: fillMode });

  if (isImageEditorTargeting(imageEditor, nodeId, paintIndex, property) && imageEditor.mode !== 'position') {
    dispatch(setImageEditor({ ...imageEditor, mode: 'position' }));
  }
};

const enterImageCropMode = (
  dispatch: AppDispatch,
  imageEditor: TImageEditorState | null,
  nodeId: string | undefined,
  paintIndex: number,
  property: TPaintProperty,
): void => {
  if (isImageEditorTargeting(imageEditor, nodeId, paintIndex, property) && imageEditor.mode !== 'crop') {
    dispatch(setImageEditor({ ...imageEditor, mode: 'crop' }));
    seedImageCropIfNeeded(dispatch, selectNodes(store.getState())[imageEditor.nodeId], imageEditor.paintIndex, property);
  }
};

const enterImageTileMode = (
  dispatch: AppDispatch,
  paint: TImagePaint | TVideoPaint,
  onChange: TFunc<[TPaint]>,
  imageEditor: TImageEditorState | null,
  nodeId: string | undefined,
  paintIndex: number,
  property: TPaintProperty,
): void => {
  onChange({ ...paint, crop: undefined, scale: paint.scale ?? IMAGE_FILL_DEFAULT_TILE_SCALE, scaleMode: 'tile' });

  if (isImageEditorTargeting(imageEditor, nodeId, paintIndex, property) && imageEditor.mode !== 'tile') {
    dispatch(setImageEditor({ ...imageEditor, mode: 'tile' }));
  }
};

export const useSetImagePaintScaleMode = (
  paint: TPaint,
  onChange: TFunc<[TPaint]>,
  nodeId: string | undefined,
  paintIndex: number,
  property: TPaintProperty = 'fills',
): TFunc<[TImageFillMode]> => {
  const dispatch = useAppDispatch();
  const imageEditor = useAppSelector(selectImageEditor);

  return (fillMode): void => {
    if ((paint.type === 'image' || paint.type === 'video') && (fillMode === 'fill' || fillMode === 'fit')) {
      applyImageFillModeChange(dispatch, paint, onChange, imageEditor, nodeId, paintIndex, property, fillMode);
    } else if ((paint.type === 'image' || paint.type === 'video') && fillMode === 'crop') {
      enterImageCropMode(dispatch, imageEditor, nodeId, paintIndex, property);
    } else if ((paint.type === 'image' || paint.type === 'video') && fillMode === 'tile') {
      enterImageTileMode(dispatch, paint, onChange, imageEditor, nodeId, paintIndex, property);
    }
  };
};
