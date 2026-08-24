// store
import { selectNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TMoreToolName } from '../../../constants';

// utils
import { isVectorEditMoreToolDisabled } from 'components/Design/Canvas/utils/isVectorEditMoreToolDisabled';

export const useIsVectorEditMoreToolDisabled = (toolName: TMoreToolName): boolean => {
  const vectorEditingNodeIds = useAppSelector(selectVectorEditingNodeIds);
  const nodes = useAppSelector(selectNodes);

  return isVectorEditMoreToolDisabled(toolName, vectorEditingNodeIds, nodes);
};
