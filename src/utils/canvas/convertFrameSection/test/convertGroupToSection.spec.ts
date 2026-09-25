// types
import { NodeType } from 'types/design/enums';
import { TGroupNode } from 'types/design/types';

// utils
import { convertGroupToSection } from '../convertGroupToSection';
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';

const group: TGroupNode = {
  childIds: ['a'],
  height: 100,
  hidden: true,
  id: 'group-1',
  locked: true,
  name: 'Group',
  parentId: 'parent-1',
  rotation: 0,
  type: NodeType.group,
  width: 200,
  x: 10,
  y: 20,
};

describe('convertGroupToSection', () => {
  it('should keep the id, children, box and flags and give the section its default fill, stroke and corner radius', () => {
    expect(convertGroupToSection(group)).toEqual({
      ...getDefaultSectionStyle(),
      childIds: ['a'],
      height: 100,
      hidden: true,
      id: 'group-1',
      locked: true,
      name: 'Group',
      parentId: 'parent-1',
      rotation: 0,
      type: NodeType.section,
      width: 200,
      x: 10,
      y: 20,
    });
  });
});
