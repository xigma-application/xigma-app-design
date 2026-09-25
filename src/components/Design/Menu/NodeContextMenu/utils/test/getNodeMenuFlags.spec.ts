// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeMenuFlags } from '../getNodeMenuFlags';

const box = { height: 10, parentId: null, rotation: 0, width: 10, x: 0, y: 0 };
const frame = { ...box, childIds: [], clipContent: true, fills: [], id: 'frame', name: 'frame', type: NodeType.frame } as TSceneNode;
const group = { ...box, childIds: [], id: 'group', name: 'group', type: NodeType.group } as TSceneNode;
const section = { ...box, childIds: [], fills: [], id: 'section', name: 'section', type: NodeType.section } as TSceneNode;
const rectangle = { ...box, fills: [], id: 'rectangle', name: 'rectangle', type: NodeType.rectangle } as TSceneNode;
const pathText = { ...box, content: 'a', id: 'pathText', name: 'pathText', pathId: 'path', type: NodeType.text } as TSceneNode;
const maskContainer = { ...box, childIds: ['maskChild'], id: 'mask', name: 'mask', type: NodeType.mask } as TSceneNode;
const maskChild = { ...rectangle, id: 'maskChild', parentId: 'mask' } as TSceneNode;
const nodesById: Record<string, TSceneNode> = { frame, group, mask: maskContainer, maskChild, rectangle, section };

describe('getNodeMenuFlags', () => {
  it('should keep the shape items and drop the container items for shapes', () => {
    // before
    const flags = getNodeMenuFlags([rectangle, pathText], nodesById);

    // result
    expect(flags).toMatchObject({
      canFlatten: true,
      hasSection: false,
      hasTextOnPath: true,
      isContainerSelection: false,
      isFrameOrGroupSelection: false,
      isTextOnPathSelection: false,
      withFlatten: true,
      withFlip: true,
      withRemoveMask: false,
      withUseAsMask: true,
    });
  });

  it('should drop every item a section does not have once a section is selected with a shape', () => {
    // before
    const flags = getNodeMenuFlags([section, rectangle], nodesById);

    // result
    expect(flags).toMatchObject({ hasSection: true, isSectionSelection: false, withFlatten: false, withFlip: false, withUseAsMask: false });
  });

  it('should show the container items only when every node is a container', () => {
    // result
    expect(getNodeMenuFlags([frame, group], nodesById)).toMatchObject({
      canConvertToSection: false,
      canUngroup: false,
      isContainerSelection: true,
      isFrameOrGroupSelection: true,
      isFrameOrSectionSelection: false,
    });
    expect(getNodeMenuFlags([frame, section], nodesById)).toMatchObject({ isFrameOrSectionSelection: true, isSectionSelection: false });
    expect(getNodeMenuFlags([frame], nodesById).canConvertToSection).toBe(true);
    expect(getNodeMenuFlags([group], nodesById).canUngroup).toBe(true);
  });

  it('should offer Remove mask only when every node is a mask or its mask shape', () => {
    // result
    expect(getNodeMenuFlags([maskContainer, maskChild], nodesById)).toMatchObject({ withRemoveMask: true, withUseAsMask: false });
    expect(getNodeMenuFlags([maskContainer, rectangle], nodesById)).toMatchObject({ withRemoveMask: false, withUseAsMask: false });
  });

  it('should disable Flatten and Outline stroke when one node cannot do it', () => {
    // result
    expect(getNodeMenuFlags([rectangle, group], nodesById)).toMatchObject({ canFlatten: false, canOutlineStroke: false });
  });
});
