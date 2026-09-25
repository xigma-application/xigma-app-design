// others
import { ARC_FIELD_LIMITS, ARC_FIELD_UNITS } from '../../constants';
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { AppDispatch } from 'store';

// types
import { TArcField, TArcFieldKey } from '../../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { commitEllipseArcValue } from './commitEllipseArcValue';
import { formatArcValue } from './formatArcValue';
import { getEllipseArcValues } from './getEllipseArcValues';
import { handleArcFieldBlur } from './handleArcFieldBlur';

export const getArcField = (dispatch: AppDispatch, nodes: TEllipseNode[], key: TArcFieldKey): TArcField => {
  const values = nodes.map((node) => getEllipseArcValues(node)[key]);
  const value = values[0] ?? 0;
  const isMixed = values.some((nodeValue) => formatArcValue(nodeValue, '') !== formatArcValue(value, ''));
  const displayValue = isMixed ? MIXED_LABEL : formatArcValue(value, ARC_FIELD_UNITS[key]);

  return {
    ...ARC_FIELD_LIMITS[key],
    displayValue,
    key,
    onBlur: (event): void => handleArcFieldBlur(event, dispatch, nodes, key, displayValue),
    onScrub: (next): void => commitEllipseArcValue(dispatch, nodes, key, (node) => getEllipseArcValues(node)[key] + next - value),
    value,
  };
};
