import { FC } from 'react';

// components
import BooleanPanel from './Boolean/Boolean';
import Ellipse from './Ellipse/Ellipse';
import Frame from './Frame/Frame';
import FrameTool from './FrameTool/FrameTool';
import GridSettings from './GridSettings/GridSettings';
import Group from './Group/Group';
import ImageCrop from './ImageCrop/ImageCrop';
import Line from './Line/Line';
import Mixed from './Mixed/Mixed';
import NoSelection from './NoSelection/NoSelection';
import Polygon from './Polygon/Polygon';
import Rectangle from './Rectangle/Rectangle';
import Section from './Section/Section';
import Slice from './Slice/Slice';
import Star from './Star/Star';
import Vector from './Vector/Vector';
import VectorEdit from './Vector/VectorEdit/VectorEdit';

// hooks
import { useCloseGridSettingsPanelOnReselect } from './hooks/useCloseGridSettingsPanelOnReselect';
import { useIsEditingImageCrop } from './Common/hooks/useIsEditingImageCrop';
import { useIsNoSelection } from '../hooks/useIsNoSelection';

// store
import { selectActiveTool, selectIsGridSettingsPanelOpen, selectSelectedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';

// utils
import { isPanelTypeSelection } from './Mixed/utils/isPanelTypeSelection';

const PanelProperties: FC = () => {
  const activeTool = useAppSelector(selectActiveTool);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const isGridSettingsPanelOpen = useAppSelector(selectIsGridSettingsPanelOpen);
  const vectorEditingNodeIds = useAppSelector(selectVectorEditingNodeIds);
  const isNoSelection = useIsNoSelection();
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : undefined;
  const isGridFrameSelected = selectedNode?.type === NodeType.frame && selectedNode.layoutMode === LayoutMode.grid;
  const isEditingImageCrop = useIsEditingImageCrop();
  const isEveryFrameSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.frame);
  const isEveryRectangleSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.rectangle);
  const isEveryGroupSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.group);
  const isEverySectionSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.section);
  const isEveryLineSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.line);
  const isEveryEllipseSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.ellipse);
  const isEveryPolygonSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.polygon);
  const isEveryStarSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.star);
  const isEveryVectorSelected = selectedNodes.length > 0 && selectedNodes.every((node) => node?.type === NodeType.vector);
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
    case isEveryLineSelected:
      return <Line />;
    case isEveryEllipseSelected:
      return <Ellipse />;
    case isEveryPolygonSelected:
      return <Polygon />;
    case isEveryStarSelected:
      return <Star />;
    case isEveryVectorSelected && vectorEditingNodeIds.length > 0:
      return <VectorEdit />;
    case isEveryVectorSelected:
      return <Vector />;
    case isPanelTypeSelection(selectedNodes):
      return <Mixed />;
    default:
      return null;
  }
};

export default PanelProperties;
