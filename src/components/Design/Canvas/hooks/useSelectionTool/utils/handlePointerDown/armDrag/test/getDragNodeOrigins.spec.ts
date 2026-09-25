// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getDragNodeOrigins } from '../getDragNodeOrigins';

vi.mock('components/Design/Canvas/utils/getVectorNodeOrigin', () => ({ getVectorNodeOrigin: (): string => 'vector-origin' }));

const nodes = {
  line: { id: 'line', type: NodeType.line, x: 1, y: 3 },
  rect: { id: 'rect', type: NodeType.rectangle, x: 5, y: 6 },
  vector: { id: 'vector', type: NodeType.vector },
} as unknown as Record<string, TSceneNode>;

describe('getDragNodeOrigins', () => {
  it('should remember where each dragged node started, by its own kind of position', () => {
    // result
    expect(getDragNodeOrigins(['line', 'rect', 'vector'], nodes)).toEqual({
      line: { x: 1, y: 3 },
      rect: { x: 5, y: 6 },
      vector: 'vector-origin',
    });
  });
});
