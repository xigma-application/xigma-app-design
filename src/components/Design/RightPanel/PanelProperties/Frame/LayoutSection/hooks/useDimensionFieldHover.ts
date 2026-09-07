// hooks
import { useAppDispatch } from 'store';

// store
import { setHoveredDimensionField } from 'store/design/slice';

// types
import { TDimensionHintField } from 'store/design/types';

export type TUseDimensionFieldHoverResult = {
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
};

export const useDimensionFieldHover = (field: TDimensionHintField): TUseDimensionFieldHoverResult => {
  const dispatch = useAppDispatch();

  return {
    onMouseEnter: () => dispatch(setHoveredDimensionField(field)),
    onMouseLeave: () => dispatch(setHoveredDimensionField(null)),
  };
};
