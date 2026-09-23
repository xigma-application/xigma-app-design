// types
import { NodeType, SizingMode } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSizeLabelSizingModes } from '../getSizeLabelSizingModes';

describe('getSizeLabelSizingModes', () => {
  it('should read the width/height sizing modes off a box node', () => {
    // before
    const node = {
      heightSizingMode: SizingMode.fill,
      type: NodeType.frame,
      widthSizingMode: SizingMode.hug,
    } as TSceneNode;

    // result
    expect(getSizeLabelSizingModes(node)).toEqual({ height: SizingMode.fill, width: SizingMode.hug });
  });

  it('should return undefined for a line node, which has no sizing modes', () => {
    // before
    const node = { type: NodeType.line } as TSceneNode;

    // result
    expect(getSizeLabelSizingModes(node)).toBeUndefined();
  });

  it('should return undefined for a vector node, which has no sizing modes', () => {
    // before
    const node = { type: NodeType.vector } as TSceneNode;

    // result
    expect(getSizeLabelSizingModes(node)).toBeUndefined();
  });
});
