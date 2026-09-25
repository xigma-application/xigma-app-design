// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TSceneNode } from 'types/design/types';

// utils
import { getBooleanGeometry } from '../getBooleanGeometry';

const computeMock = vi.fn();
const operandMock = vi.fn();

vi.mock('../computeBooleanVectorNode', () => ({ computeBooleanVectorNode: (...args: unknown[]): unknown => computeMock(...args) }));
vi.mock('../getBooleanOperandVector', () => ({ getBooleanOperandVector: (...args: unknown[]): unknown => operandMock(...args) }));

const vectorOperand = { id: 'v', type: NodeType.vector };
const otherOperand = { id: 'o', type: NodeType.rectangle };
const nodesById = { a: { id: 'a' }, b: { id: 'b' }, c: { id: 'c' } } as unknown as Record<string, TSceneNode>;

const makeBoolean = (id: string, booleanOperation: BooleanOperation): TBooleanNode =>
  ({ booleanOperation, childIds: ['a', 'b', 'c', 'missing'], id }) as unknown as TBooleanNode;

describe('getBooleanGeometry', () => {
  beforeEach(() => {
    computeMock.mockClear().mockImplementation(() => ({ id: 'result' }));
    operandMock.mockImplementation((node: { id: string }) => ({ a: vectorOperand, b: otherOperand, c: null })[node.id]);
  });

  it('should combine only the vector operands of the existing children', () => {
    // mock
    const node = makeBoolean('bool-1', BooleanOperation.union);

    // before
    const result = getBooleanGeometry(node, nodesById);

    // result
    expect(computeMock).toHaveBeenCalledWith(node, [vectorOperand]);
    expect(result).toEqual({ id: 'result' });
  });

  it('should reuse the cached result while the operands and operation stay the same', () => {
    // mock
    const node = makeBoolean('bool-2', BooleanOperation.union);

    // before
    const first = getBooleanGeometry(node, nodesById);
    const second = getBooleanGeometry(node, nodesById);

    // result
    expect(second).toBe(first);
    expect(computeMock).toHaveBeenCalledTimes(1);
  });

  it('should recompute when the operation changes', () => {
    // before
    getBooleanGeometry(makeBoolean('bool-3', BooleanOperation.union), nodesById);
    getBooleanGeometry(makeBoolean('bool-3', BooleanOperation.subtract), nodesById);

    // result
    expect(computeMock).toHaveBeenCalledTimes(2);
  });
});
