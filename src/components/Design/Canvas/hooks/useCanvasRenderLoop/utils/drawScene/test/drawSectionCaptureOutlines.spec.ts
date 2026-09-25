// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { drawHoverOutline } from '../drawHoverOutline';
import { drawSectionCaptureOutlines } from '../drawSectionCaptureOutlines';

vi.mock('../drawHoverOutline', () => ({ drawHoverOutline: vi.fn() }));

describe('drawSectionCaptureOutlines', () => {
  it('should draw a hover-style outline for every layer the section would collect', () => {
    // mock
    const context = {} as TDrawSceneContext;
    const canvasRefs = createCanvasRefs();
    const node = { id: 'a', type: NodeType.rectangle } as TSceneNode;
    canvasRefs.transform.sectionCaptureIdsRef.current = ['a'];

    // action
    drawSectionCaptureOutlines(context, canvasRefs, [], { a: node });

    // result
    expect(drawHoverOutline).toHaveBeenCalledWith(context, node, [], { a: node });
  });
});
