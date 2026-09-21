// types
import { ExportScale } from '../../enums';

// utils
import { getExportScaleFactor } from '../getExportScaleFactor';

const bounds = { height: 200, width: 100, x: 0, y: 0 };

describe('getExportScaleFactor', () => {
  it('should return 0.5 for half', () => {
    expect(getExportScaleFactor(ExportScale.half, bounds)).toBe(0.5);
  });

  it('should return 0.75 for threeQuarters', () => {
    expect(getExportScaleFactor(ExportScale.threeQuarters, bounds)).toBe(0.75);
  });

  it('should return 1 for one', () => {
    expect(getExportScaleFactor(ExportScale.one, bounds)).toBe(1);
  });

  it('should return 1.5 for oneAndHalf', () => {
    expect(getExportScaleFactor(ExportScale.oneAndHalf, bounds)).toBe(1.5);
  });

  it('should return 2 for two', () => {
    expect(getExportScaleFactor(ExportScale.two, bounds)).toBe(2);
  });

  it('should return 3 for three', () => {
    expect(getExportScaleFactor(ExportScale.three, bounds)).toBe(3);
  });

  it('should return 4 for four', () => {
    expect(getExportScaleFactor(ExportScale.four, bounds)).toBe(4);
  });

  it('should derive the scale that makes the width exactly 512 for width512', () => {
    expect(getExportScaleFactor(ExportScale.width512, bounds)).toBe(5.12);
  });

  it('should return 1 for width512 when the bounds have no width', () => {
    expect(getExportScaleFactor(ExportScale.width512, { ...bounds, width: 0 })).toBe(1);
  });

  it('should derive the scale that makes the height exactly 512 for height512', () => {
    expect(getExportScaleFactor(ExportScale.height512, bounds)).toBe(2.56);
  });

  it('should return 1 for height512 when the bounds have no height', () => {
    expect(getExportScaleFactor(ExportScale.height512, { ...bounds, height: 0 })).toBe(1);
  });
});
