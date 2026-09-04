import { FC, Fragment } from 'react';

// components
import Design from './Design/Design';
import Export from './Export/Export';
import Frame from './Frame/Frame';
import Mcp from './Mcp/Mcp';
import Styles from './Styles/Styles';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';

const PanelProperties: FC = () => {
  const selectedNodes = useAppSelector(selectSelectedNodes);

  if (selectedNodes.length === 0) {
    return (
      <Fragment>
        <Design />
        <Styles />
        <Export />
        <Mcp />
      </Fragment>
    );
  }

  if (selectedNodes.length === 1 && selectedNodes[0]?.type === NodeType.frame) {
    return <Frame />;
  }

  return null;
};

export default PanelProperties;
