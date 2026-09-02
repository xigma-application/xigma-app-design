// @xigma
import { TIconProps } from '@xigma/components';

export type TActionsPanelSection = 'commonSettings' | 'recents' | 'suggestions';

export type TActionsPanelAction = 'selectAll' | 'undo';

export type TActionsPanelItem = {
  action?: TActionsPanelAction;
  icon?: TIconProps['name'];
  id: string;
  labelKey: string;
  section: TActionsPanelSection;
  shortcut?: string;
  withCheck?: boolean;
};
