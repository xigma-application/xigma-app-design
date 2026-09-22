// store
import { setIsExporting } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TExportSetting } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { exportNode } from '../utils/exportNode';

export const useHandleExportClick = (node: TSceneNode | undefined, settings: TExportSetting[]): TFunc<[], Promise<void>> => {
  const dispatch = useAppDispatch();

  return async (): Promise<void> => {
    if (node) {
      dispatch(setIsExporting(true));

      try {
        await exportNode(node.id, node.name, settings);
      } finally {
        dispatch(setIsExporting(false));
      }
    }
  };
};
