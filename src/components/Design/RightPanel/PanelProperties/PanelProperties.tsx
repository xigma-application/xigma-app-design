import { FC } from 'react';

// components
import BooleanPanel from './Boolean/Boolean';
import Frame from './Frame/Frame';
import FrameTool from './FrameTool/FrameTool';
import GridSettings from './GridSettings/GridSettings';
import Group from './Group/Group';
import ImageCrop from './ImageCrop/ImageCrop';
import Mixed from './Mixed/Mixed';
import NoSelection from './NoSelection/NoSelection';
import Rectangle from './Rectangle/Rectangle';
import Section from './Section/Section';
import Slice from './Slice/Slice';

// hooks
import { useCloseGridSettingsPanelOnReselect } from './hooks/useCloseGridSettingsPanelOnReselect';
import { useIsEditingImageCrop } from './Common/hooks/useIsEditingImageCrop';
import { useIsNoSelection } from '../hooks/useIsNoSelection';

// store
import { selectActiveTool, selectIsGridSettingsPanelOpen, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';

// utils
import { isPanelTypeSelection } from './Mixed/utils/isPanelTypeSelection';

const PanelProperties: FC = () => {
  const activeTool = useAppSelector(selectActiveTool);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const isGridSettingsPanelOpen = useAppSelector(selectIsGridSettingsPanelOpen);
  const isNoSelection = useIsNoSelection();
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : undefined;
  const isGridFrameSelected = selectedNode?.type === NodeType.frame && selectedNode.layoutMode === LayoutMode.grid;
  const isEditingImageCrop = useIsEditingImageCrop();
  const isEveryFrameSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.frame);
  const isEveryRectangleSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.rectangle);
  const isEveryGroupSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.group);
  const isEverySectionSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.section);
  const isEverySliceSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.slice);

  useCloseGridSettingsPanelOnReselect(selectedNodes.length > 0, isGridSettingsPanelOpen);

  switch (true) {
    case activeTool === ToolName.frame:
      return <FrameTool />;
    case isNoSelection:
      return <NoSelection />;
    case isEditingImageCrop:
      return <ImageCrop />;
    case isGridFrameSelected && isGridSettingsPanelOpen:
      return <GridSettings />;
    case isEveryFrameSelected:
      return <Frame />;
    case isEveryRectangleSelected:
      return <Rectangle />;
    case selectedNodes.length === 1 && selectedNodes[0]?.type === NodeType.boolean:
      return <BooleanPanel />;
    case isEveryGroupSelected:
      return <Group />;
    case isEverySectionSelected:
      return <Section />;
    case isEverySliceSelected:
      return <Slice />;
    case isPanelTypeSelection(selectedNodes):
      return <Mixed />;
    default:
      return null;
  }
};

export default PanelProperties;
