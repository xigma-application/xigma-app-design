import { FC } from 'react';

// components
import DistributeMenuButton from './DistributeMenuButton';

// hooks
import { useDistributeMenu } from './hooks/useDistributeMenu';

export const DistributeMenu: FC = () => <DistributeMenuButton {...useDistributeMenu()} />;

export default DistributeMenu;
