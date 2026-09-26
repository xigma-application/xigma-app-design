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
  const entries = useSelectedVectorPoints().filter(({ pointIds }) => pointIds.length > 0);
  const disabled = entries.length === 0;

  const handleChange = (mode: string): void =>
    history.run(() =>
      entries.forEach(({ node, pointIds }) => {
        const modes = Object.fromEntries(pointIds.map((vertexId) => [vertexId, mode as TVertexHandleMode]));
        dispatch(updateNode({ changes: { vertexHandleModes: { ...node.vertexHandleModes, ...modes } }, id: node.id }));
      }),
    );

  return { disabled, onChange: handleChange, value: disabled ? '' : getVectorPointsMirroring(entries) };
};
