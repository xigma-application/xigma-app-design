import { FC } from 'react';

// components
import Frame from './Frame/Frame';
import FrameTool from './FrameTool/FrameTool';
import GridSettings from './GridSettings/GridSettings';
import NoSelection from './NoSelection/NoSelection';
import Rectangle from './Rectangle/Rectangle';

// store
import { selectActiveTool, selectIsGridSettingsPanelOpen, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';

const PanelProperties: FC = () => {
  const activeTool = useAppSelector(selectActiveTool);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const isGridSettingsPanelOpen = useAppSelector(selectIsGridSettingsPanelOpen);
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : undefined;
  const isGridFrameSelected = selectedNode?.type === NodeType.frame && selectedNode.layoutMode === LayoutMode.grid;

  switch (true) {
    case activeTool === ToolName.frame:
      return <FrameTool />;
    case selectedNodes.length === 0:
      return <NoSelection />;
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
