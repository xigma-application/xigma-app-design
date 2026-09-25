// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isPaintPropertyNode } from '../isPaintPropertyNode';

const line = { type: NodeType.line } as TSceneNode;
const rectangle = { type: NodeType.rectangle } as TSceneNode;

describe('isPaintPropertyNode', () => {
  it('should let a line take strokes alongside the appearance nodes', () => {
    // result
    expect(isPaintPropertyNode(line, 'strokes')).toBe(true);
    expect(isPaintPropertyNode(rectangle, 'strokes')).toBe(true);
  });

  it('should keep a line out of the fills', () => {
    // result
    expect(isPaintPropertyNode(line, 'fills')).toBe(false);
    expect(isPaintPropertyNode(rectangle, 'fills')).toBe(true);
  });
});
