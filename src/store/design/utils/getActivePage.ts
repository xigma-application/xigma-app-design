// types
import { TDesignPage, TDesignState } from '../types';

export const getActivePage = (state: TDesignState): TDesignPage => state.pages[state.activePageId];
