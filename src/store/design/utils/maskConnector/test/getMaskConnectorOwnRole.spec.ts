// utils
import { getMaskConnectorOwnRole } from '../getMaskConnectorOwnRole';

describe('getMaskConnectorOwnRole', () => {
  it('should return undefined when the group has no mask child', () => {
    expect(getMaskConnectorOwnRole(-1, 0)).toBeUndefined();
  });

  it('should return undefined for the mask itself when it is childIds[0] (nothing above it)', () => {
    expect(getMaskConnectorOwnRole(0, 0)).toBeUndefined();
  });

  it('should return "masked-start" for the first child before the mask', () => {
    expect(getMaskConnectorOwnRole(2, 0)).toBe('masked-start');
  });

  it('should return "masked-continue" for a later child before the mask', () => {
    expect(getMaskConnectorOwnRole(2, 1)).toBe('masked-continue');
  });

  it('should return "mask" for the mask child itself', () => {
    expect(getMaskConnectorOwnRole(2, 2)).toBe('mask');
  });

  it('should return undefined for a child after the mask', () => {
    expect(getMaskConnectorOwnRole(1, 2)).toBeUndefined();
  });
});
