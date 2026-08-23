import { FC } from 'react';

// components
import VectorEditMoreDropdownItem from '../VectorEditMoreDropdownItem/VectorEditMoreDropdownItem';

// others
import { MORE_TOOLS } from '../../constants';

// types
import { ToolName } from 'types/design/enums';

export type TVectorEditMoreDropdownItemsProps = {
  lastMoreTool: ToolName | null;
};

const VectorEditMoreDropdownItems: FC<TVectorEditMoreDropdownItemsProps> = ({ lastMoreTool }) => (
  <>
    {MORE_TOOLS.map((tool) => (
      <VectorEditMoreDropdownItem key={tool.toolName} selected={tool.toolName === lastMoreTool} tool={tool} />
    ))}
  </>
);

export default VectorEditMoreDropdownItems;
