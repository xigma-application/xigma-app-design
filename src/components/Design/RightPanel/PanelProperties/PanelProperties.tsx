import { FC } from 'react';

// components
import Frame from './Frame/Frame';
import FrameTool from './FrameTool/FrameTool';
import NoSelection from './NoSelection/NoSelection';

// store
import { selectActiveTool, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

const PanelProperties: FC = () => {
  const activeTool = useAppSelector(selectActiveTool);
  const selectedNodes = useAppSelector(selectSelectedNodes);

  switch (true) {
    case activeTool === ToolName.frame:
      return <FrameTool />;
    case selectedNodes.length === 0:
      return <NoSelection />;
    case selectedNodes.length === 1 && selectedNodes[0]?.type === NodeType.frame:
      return <Frame />;
    default:
      return null;
  }
};

export default PanelProperties;
