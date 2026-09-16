// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TImageFillMode } from 'shared/UITools/ColorPicker/Body/ImagePanel/types';
import { TPaint } from 'types/design/paint/types';

export const useSetImagePaintScaleMode = (
  paint: TPaint,
  onChange: TFunc<[TPaint]>,
  nodeId: string | undefined,
  paintIndex: number,
): TFunc<[TImageFillMode]> => {
  const dispatch = useAppDispatch();
  const imageEditor = useAppSelector(selectImageEditor);

  return (fillMode): void => {
    if (paint.type === 'image' && (fillMode === 'fill' || fillMode === 'fit')) {
      onChange({ ...paint, scaleMode: fillMode });
    } else if (
      fillMode === 'crop' &&
      imageEditor &&
      imageEditor.nodeId === nodeId &&
      imageEditor.paintIndex === paintIndex &&
      imageEditor.mode !== 'crop'
    ) {
      dispatch(setImageEditor({ ...imageEditor, mode: 'crop' }));
    }
  };
};
