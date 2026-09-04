import { FC } from 'react';

// components
import Design from './Design/Design';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

const PanelProperties: FC = () => {
  const selectedIds = useAppSelector(selectSelectedIds);

  if (selectedIds.length > 0) {
    return null;
  }

  return <Design />;
};

export default PanelProperties;
