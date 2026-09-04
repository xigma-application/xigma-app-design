import { FC, Fragment } from 'react';

// components
import Design from '../Design/Design';
import Export from '../Export/Export';
import Mcp from '../Mcp/Mcp';
import Styles from '../Styles/Styles';

const NoSelection: FC = () => (
  <Fragment>
    <Design />
    <Styles />
    <Export />
    <Mcp />
  </Fragment>
);

export default NoSelection;
