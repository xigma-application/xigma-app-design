// types
import { AlignmentHorizontal, AlignmentVertical, LayoutMode, NodeType } from 'types/design/enums';
import { TBoxSceneNode, TSceneNode } from 'types/design/types';
import { TSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

// utils
import { getPositionEntry } from '../getPositionEntry';

const child = (patch: object = {}): TBoxSceneNode => ({ id: 'c', parentId: 'p', x: 110.4, y: 220.6, ...patch }) as TBoxSceneNode;

const parent = (patch: object = {}): TSceneNode =>
  ({ childIds: ['c'], height: 400, id: 'p', rotation: 0, type: NodeType.frame, width: 400, x: 100, y: 200, ...patch }) as TSceneNode;

describe('getPositionEntry', () => {
  it('should show the rounded position relative to a boxed parent', () => {
    // mock
    const nodes = { p: parent() };

    // before
    const entry = getPositionEntry(child(), nodes, undefined);

    // result
    expect(entry).toEqual({ disabledX: false, disabledY: false, id: 'c', parent: nodes.p, x: 10, y: 21 });
  });

  it('should disable both axes inside an auto layout parent and each pinned axis otherwise', () => {
    // mock
    const flow = { p: parent({ layoutMode: LayoutMode.horizontal }) };
    const free = { p: parent() };

    // result
    expect(getPositionEntry(child(), flow, undefined)).toMatchObject({ disabledX: true, disabledY: true });
    expect(getPositionEntry(child({ ignoreAutoLayout: true }), flow, undefined)).toMatchObject({ disabledX: false, disabledY: false });
    expect(getPositionEntry(child({ alignment: { horizontal: AlignmentHorizontal.left } }), free, undefined)).toMatchObject({
      disabledX: true,
      disabledY: false,
    });
    expect(getPositionEntry(child({ alignment: { vertical: AlignmentVertical.top } }), free, undefined)).toMatchObject({
      disabledX: false,
      disabledY: true,
    });
  });

  it('should show the absolute position of a top-level node or one inside a parent without a box', () => {
    // result
    expect(getPositionEntry(child({ parentId: null }), {}, undefined)).toMatchObject({ parent: undefined, x: 110.4, y: 220.6 });
    expect(getPositionEntry(child(), { p: { id: 'p', type: NodeType.group } as unknown as TSceneNode }, undefined)).toMatchObject({
      parent: undefined,
      x: 110.4,
    });
  });

  it('should show the image crop position and never disable it', () => {
    // mock
    const imageCrop = { crop: { height: 10, width: 10, x: 150, y: 250 } } as unknown as TSelectedImageCrop;

    // before
    const entry = getPositionEntry(
      child({ alignment: { horizontal: AlignmentHorizontal.left } }),
      { p: parent({ layoutMode: LayoutMode.vertical }) },
      imageCrop,
    );

    // result
    expect(entry).toMatchObject({ disabledX: false, disabledY: false, x: 50, y: 50 });
  });
});
