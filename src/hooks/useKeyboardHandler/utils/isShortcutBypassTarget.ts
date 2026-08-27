// others
import { getDataTestAttribute } from 'shared/E2EDataAttributes/utils/getDataTestAttribute';

// types
import { E2EAttribute } from 'types/e2e';

const BYPASS_SELECTOR = `[${getDataTestAttribute(E2EAttribute.bypassGlobalShortcuts)}]`;

export const isShortcutBypassTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.closest(BYPASS_SELECTOR) !== null;
