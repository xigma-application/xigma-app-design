import { FC } from 'react';

// components
import VectorEditMoreDropdownPlaceholder from './VectorEditMoreDropdownPlaceholder/VectorEditMoreDropdownPlaceholder';
import VectorEditMoreDropdownTool from './VectorEditMoreDropdownTool/VectorEditMoreDropdownTool';

// store
import { selectLastMoreTool } from 'store/design/selectors';
import { useAppSelector } from 'store';

// utils
import { isMoreToolName } from './utils/isMoreToolName';

const VectorEditMoreDropdown: FC = () => {
  const lastMoreTool = useAppSelector(selectLastMoreTool);

  if (lastMoreTool !== null && isMoreToolName(lastMoreTool)) {
    return <VectorEditMoreDropdownTool toolName={lastMoreTool} />;
  }

  return <VectorEditMoreDropdownPlaceholder />;
};

export default VectorEditMoreDropdown;
