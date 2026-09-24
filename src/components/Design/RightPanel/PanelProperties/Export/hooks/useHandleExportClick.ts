// store
import { setIsExporting } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TExportSetting, TExportTarget } from '../types';

// utils
import { exportNodes } from '../utils/exportNodes';

export const useHandleExportClick = (
  exportTargets: TExportTarget[],
  settings: TExportSetting[],
  zipName: string,
): TFunc<[], Promise<void>> => {
  const dispatch = useAppDispatch();

  return async (): Promise<void> => {
    dispatch(setIsExporting(true));

    try {
      await exportNodes(exportTargets, settings, zipName);
    } finally {
      dispatch(setIsExporting(false));
    }
  };
};
