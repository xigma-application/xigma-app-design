import { FC } from 'react';

// components
import Frame from './Frame/Frame';
import FrameTool from './FrameTool/FrameTool';
import GridSettings from './GridSettings/GridSettings';
import ImageCrop from './ImageCrop/ImageCrop';
import NoSelection from './NoSelection/NoSelection';
import Rectangle from './Rectangle/Rectangle';

// hooks
import { useCloseGridSettingsPanelOnReselect } from './hooks/useCloseGridSettingsPanelOnReselect';
import { useIsEditingImageCrop } from './Common/hooks/useIsEditingImageCrop';
import { useIsNoSelection } from '../hooks/useIsNoSelection';

// store
import { selectActiveTool, selectIsGridSettingsPanelOpen, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';

const PanelProperties: FC = () => {
  const activeTool = useAppSelector(selectActiveTool);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const isGridSettingsPanelOpen = useAppSelector(selectIsGridSettingsPanelOpen);
  const isNoSelection = useIsNoSelection();
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : undefined;
  const isGridFrameSelected = selectedNode?.type === NodeType.frame && selectedNode.layoutMode === LayoutMode.grid;
  const isEditingImageCrop = useIsEditingImageCrop();

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
    case selectedNodes.length === 1 && selectedNodes[0]?.type === NodeType.frame:
      return <Frame />;
    case selectedNodes.length === 1 && selectedNodes[0]?.type === NodeType.rectangle:
      return <Rectangle />;
    default:
      return null;
  }
};

export default PanelProperties;
