// store
import { setIsExporting } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TExportSetting, TExportTarget } from '../types';

// utils
import { exportNode } from '../utils/exportNode';

export const useHandleExportClick = (exportTarget: TExportTarget, settings: TExportSetting[]): TFunc<[], Promise<void>> => {
  const dispatch = useAppDispatch();

  return async (): Promise<void> => {
    dispatch(setIsExporting(true));

    try {
      await exportNode(exportTarget.id, exportTarget.name, settings);
    } finally {
      dispatch(setIsExporting(false));
    }
  };
};
