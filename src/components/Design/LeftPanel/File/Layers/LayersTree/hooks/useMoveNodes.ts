// store
import { moveNodes } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TMoveNodesPayload } from 'store/design/types';

export const useMoveNodes = (): TFunc<[TMoveNodesPayload]> => {
  const dispatch = useAppDispatch();

  return (payload: TMoveNodesPayload): void => {
    dispatch(moveNodes(payload));
  };
};
