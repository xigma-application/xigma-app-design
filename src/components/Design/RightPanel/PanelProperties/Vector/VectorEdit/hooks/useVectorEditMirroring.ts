// hooks
import { useSelectedVectorPoints } from './useSelectedVectorPoints';
import { useVectorPointsHistory } from './useVectorPointsHistory';

// store
import { updateNode } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TVertexHandleMode } from 'types/design/types';

// utils
import { getVectorPointsMirroring } from '../utils/getVectorPointsMirroring';

export type TUseVectorEditMirroringResult = { disabled: boolean; onChange: TFunc<[string]>; value: string };

export const useVectorEditMirroring = (): TUseVectorEditMirroringResult => {
  const dispatch = useAppDispatch();
  const history = useVectorPointsHistory();
  const { node, vertexIds } = useSelectedVectorPoints();
  const disabled = !node || vertexIds.length === 0;

  const handleChange = (mode: string): void =>
    history.run(() => {
      const modes = Object.fromEntries(vertexIds.map((vertexId) => [vertexId, mode as TVertexHandleMode]));
      dispatch(updateNode({ changes: { vertexHandleModes: { ...node!.vertexHandleModes, ...modes } }, id: node!.id }));
    });

  return { disabled, onChange: handleChange, value: disabled ? '' : getVectorPointsMirroring(node, vertexIds) };
};
