// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

export const getTextBaselineOffset = (fontSize: number): number => MSDF_ATLAS_JSON.common.base * (fontSize / MSDF_ATLAS_JSON.info.size);
