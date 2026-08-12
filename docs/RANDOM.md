import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

// others
import { DEFAULT_TOOL, DEFAULT_VIEWPORT } from './constants';

// types
import { TDesignState } from './types';
import { NodeType, ToolName } from 'types/design/enums';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { handleAddNode } from './utils/handleAddNode';
import { handleUpdateNode } from './utils/handleUpdateNode';

const RANDOM_FRAME_SIZE = 40;
const RANDOM_FRAME_SPREAD = 4000;

// const getRandomChannel = (): string =>
// Math.floor(Math.random() * 256)
// .toString(16)
// .padStart(2, '0');

// const getRandomColor = (): string => `#${getRandomChannel()}${getRandomChannel()}${getRandomChannel()}`;

// // perf-testing helper — generates `count` random frames, scattered across a fixed-size area with
// // random fill colors, ready to spread into initialState.nodes/rootOrder
// export const generateRandomFrames = (count: number): Pick<TDesignState, 'nodes' | 'rootOrder'> => {
// const nodes: Record<string, TSceneNode> = {};
// const rootOrder: string[] = [];

// for (let i = 0; i < count; i += 1) {
// const id = nanoid();

// nodes[id] = {
// fill: getRandomColor(),
// height: RANDOM_FRAME_SIZE,
// id,
// name: `Frame ${i + 1}`,
// parentId: null,
// rotation: 0,
// type: NodeType.frame,
// width: RANDOM_FRAME_SIZE,
// x: Math.random() * RANDOM_FRAME_SPREAD,
// y: Math.random() * RANDOM_FRAME_SPREAD,
// };
// rootOrder.push(id);
// }

// return { nodes, rootOrder };
// };

const initialState: TDesignState = {
activeTool: DEFAULT_TOOL,
nodes: {},
rootOrder: [],
selectedIds: [],
viewport: DEFAULT_VIEWPORT,
};

const designSlice = createSlice({
initialState,
name: 'design',
reducers: {
addNode: {
prepare: (node: Omit<TSceneNode, 'id'>) => ({ payload: { ...node, id: nanoid() } as TSceneNode }),
reducer: (state, action: PayloadAction<TSceneNode>) => handleAddNode(state, action.payload),
},
setActiveTool: (state, action: PayloadAction<ToolName>) => {
state.activeTool = action.payload;
},
setSelection: (state, action: PayloadAction<string[]>) => {
state.selectedIds = action.payload;
},
setViewport: (state, action: PayloadAction<TViewport>) => {
state.viewport = action.payload;
},
updateNode: (state, action: PayloadAction<{ changes: Partial<TSceneNode>; id: string }>) =>
handleUpdateNode(state, action.payload),
},
});

export const { addNode, setActiveTool, setSelection, setViewport, updateNode } = designSlice.actions;

export default designSlice.reducer;
claude --dangerously-skip-permissions
