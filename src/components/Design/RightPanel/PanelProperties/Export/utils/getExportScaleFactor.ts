// types
import { ExportScale } from '../enums';
import { TDraftRect } from 'types/canvas';

export const getExportScaleFactor = (scale: ExportScale, bounds: TDraftRect): number => {
  // eslint-disable-next-line default-case -- every ExportScale member is handled below, so a default arm would be dead code unreachable by any test
  switch (scale) {
    case ExportScale.half:
      return 0.5;
    case ExportScale.threeQuarters:
      return 0.75;
    case ExportScale.one:
      return 1;
    case ExportScale.oneAndHalf:
      return 1.5;
    case ExportScale.two:
      return 2;
    case ExportScale.three:
      return 3;
    case ExportScale.four:
      return 4;
    case ExportScale.width512:
      return bounds.width > 0 ? 512 / bounds.width : 1;
    case ExportScale.height512:
      return bounds.height > 0 ? 512 / bounds.height : 1;
  }
};
