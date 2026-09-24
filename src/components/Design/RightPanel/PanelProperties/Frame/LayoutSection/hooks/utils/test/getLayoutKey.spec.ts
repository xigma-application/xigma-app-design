// types
import { LayoutMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getLayoutKey } from '../getLayoutKey';

describe('getLayoutKey', () => {
  it('should combine the flow, defaulting to free form, with the wrap flag', () => {
    // result
    expect(getLayoutKey({} as TFrameNode)).toBe(`${LayoutMode.freeForm}:false`);
    expect(getLayoutKey({ layoutMode: LayoutMode.horizontal, layoutWrap: true } as TFrameNode)).toBe(`${LayoutMode.horizontal}:true`);
  });
});
