// store
import { convertGroupToBoolean, convertGroupToMask, replaceNode, setSelection, updateNode } from 'store/design/slice';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { store, useAppDispatch, useAppSelector } from 'store';

// types
import { BooleanOperation, LayoutMode, NodeType } from 'types/design/enums';
import { TGroupNode, TSceneNode } from 'types/design/types';

// utils
import { canHoldSection } from 'store/design/utils/nodeHierarchy/canHoldSection';
import { commitFlowChange } from '../../Frame/LayoutSection/ColumnFlow/hooks/utils/commitFlowChange';
import { commitOnGroups } from './utils/commitOnGroups';
import { convertGroupToFrame } from 'utils/canvas/convertFrameSection/convertGroupToFrame';
import { convertGroupToSection } from 'utils/canvas/convertFrameSection/convertGroupToSection';
import { getMaskShapeIds } from './utils/getMaskShapeIds';

export type TUseConvertGroupResult = {
  onConvertToBoolean: (operation: BooleanOperation) => TFunc;
  onConvertToFlow: TFunc<[string]>;
  onConvertToFrame: TFunc;
  onConvertToMask: TFunc;
  onConvertToPreset: (width: number, height: number) => TFunc;
  onConvertToSection: TFunc;
};

export const useConvertGroup = (): TUseConvertGroupResult => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectSelectedNodes).filter((node): node is TGroupNode => node?.type === NodeType.group);
  const groupIds = groups.map((group) => group.id);

  const replaceGroup = (node: TSceneNode): void => {
    dispatch(replaceNode({ id: node.id, node }));
  };

  return {
    onConvertToBoolean: (operation) => (): void =>
      commitOnGroups(dispatch, groups, (group) => {
        dispatch(convertGroupToBoolean({ groupId: group.id, operation }));
        dispatch(setSelection(groupIds));
      }),
    onConvertToFlow: (nextValue): void => {
      if (nextValue !== LayoutMode.freeForm) {
        commitOnGroups(dispatch, groups, (group) => {
          const frame = convertGroupToFrame(group);

          replaceGroup(frame);
          commitFlowChange(dispatch, frame, selectNodes(store.getState()), nextValue as LayoutMode);
        });
      }
    },
    onConvertToFrame: (): void => commitOnGroups(dispatch, groups, (group) => replaceGroup(convertGroupToFrame(group))),
    onConvertToMask: (): void =>
      commitOnGroups(dispatch, groups, (group) => {
        dispatch(convertGroupToMask(group.id));
        dispatch(setSelection(getMaskShapeIds(groupIds, selectNodes(store.getState()))));
      }),
    onConvertToPreset: (width, height) => (): void =>
      commitOnGroups(dispatch, groups, (group) => {
        replaceGroup(convertGroupToFrame(group));
        dispatch(updateNode({ changes: { height, width }, id: group.id }));
      }),
    onConvertToSection: (): void =>
      commitOnGroups(
        dispatch,
        groups.filter((group) => canHoldSection(group.parentId, selectNodes(store.getState()))),
        (group) => replaceGroup(convertGroupToSection(group)),
      ),
  };
};
