// others
import { PANEL_SECTIONS } from '../../constants';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getCommonPanelItems } from '../getCommonPanelItems';

describe('getCommonPanelItems', () => {
  it('should keep only the sections every type has, in order', () => {
    // action / result
    expect(getCommonPanelItems(PANEL_SECTIONS, [NodeType.frame, NodeType.rectangle])).toEqual([
      'position',
      'layout',
      'appearance',
      'cornerRadius',
      'fill',
      'stroke',
      'effects',
      'export',
    ]);
  });

  it('should drop the corner radius once a boolean joins', () => {
    // action / result
    expect(getCommonPanelItems(PANEL_SECTIONS, [NodeType.frame, NodeType.rectangle, NodeType.boolean])).not.toContain('cornerRadius');
  });

  it('should return nothing for no types', () => {
    // action / result
    expect(getCommonPanelItems(PANEL_SECTIONS, [])).toEqual([]);
  });
});
