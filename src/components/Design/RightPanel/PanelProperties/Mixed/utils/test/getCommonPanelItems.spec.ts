// others
import { PANEL_HEADER_BUTTONS, PANEL_SECTIONS } from '../../constants';

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

  it('should keep only the header buttons every type has', () => {
    // action / result
    expect(getCommonPanelItems(PANEL_HEADER_BUTTONS, [NodeType.rectangle, NodeType.boolean])).toEqual(['component', 'mask', 'boolean']);
    expect(getCommonPanelItems(PANEL_HEADER_BUTTONS, [NodeType.frame, NodeType.rectangle])).toEqual(['matchingLayers', 'component']);
  });

  it('should return nothing for no types', () => {
    // action / result
    expect(getCommonPanelItems(PANEL_SECTIONS, [])).toEqual([]);
  });
});
