// components
import LineEndpointLabel from '../LineEndpointLabel/LineEndpointLabel';

// others
import { LINE_ENDPOINT_ARROWS_START, LINE_ENDPOINT_ICONS, LINE_ENDPOINT_ORDER } from '../constants';

// types
import { LineEndpoint } from 'types/design/enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export const getLineEndpointOptions = (getLabel: TFunc<[LineEndpoint], string>, isFlipped: boolean): TDropdownOption<LineEndpoint>[] =>
  LINE_ENDPOINT_ORDER.map((endpoint) => ({
    content: <LineEndpointLabel icon={LINE_ENDPOINT_ICONS[endpoint]} isFlipped={isFlipped} label={getLabel(endpoint)} />,
    label: getLabel(endpoint),
    separatorBefore: endpoint === LINE_ENDPOINT_ARROWS_START,
    value: endpoint,
  }));
