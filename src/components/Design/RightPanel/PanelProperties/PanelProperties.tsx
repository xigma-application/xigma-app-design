import { FC, Fragment } from 'react';

// components
import Design from './Design/Design';
import Export from './Export/Export';
import Mcp from './Mcp/Mcp';
import Styles from './Styles/Styles';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

const PanelProperties: FC = () => {
  const selectedIds = useAppSelector(selectSelectedIds);

  if (selectedIds.length > 0) {
    return null;
  }

  return (
    <Fragment>
      <Design />
      <Styles />
      <Export />
      <Mcp />
    </Fragment>
  );
};

export default PanelProperties;
