// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions';

export const getAutoLayoutSizesById = (sizes: TAutoLayoutChildSize[]): Record<string, TAutoLayoutChildSize> =>
  sizes.reduce<Record<string, TAutoLayoutChildSize>>((byId, size) => {
    byId[size.id] = size;

    return byId;
  }, {});
