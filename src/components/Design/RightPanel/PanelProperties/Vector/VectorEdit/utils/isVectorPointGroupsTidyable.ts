// others
import { TIDY_UP_MAX_LAYERS, TIDY_UP_MIN_LAYERS, TIDY_UP_POSITION_EPSILON } from '../../../Common/PositionSection/ColumnAlignment/constants';

// types
import { TVectorPointGroup } from '../types';

// utils
import { getTidyUpVectorPointGroupDeltas } from './getTidyUpVectorPointGroupDeltas';

export const isVectorPointGroupsTidyable = (groups: TVectorPointGroup[]): boolean =>
  groups.length >= TIDY_UP_MIN_LAYERS &&
  groups.length <= TIDY_UP_MAX_LAYERS &&
  getTidyUpVectorPointGroupDeltas(groups).some(
    (delta) => Math.abs(delta.x) > TIDY_UP_POSITION_EPSILON || Math.abs(delta.y) > TIDY_UP_POSITION_EPSILON,
  );
