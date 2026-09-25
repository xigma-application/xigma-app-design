export const createMultiSelectContext = (shiftKey = false): Record<string, unknown> & { canvasRefs: Record<string, unknown> } => ({
  canvas: 'canvas',
  canvasRefs: {
    vectorEdit: {
      selectedVectorHandlesRef: { current: ['h'] },
      selectedVectorSegmentIdsRef: { current: ['s'] },
      selectedVectorVertexIdsRef: { current: ['a'] },
    },
    vectorMultiSelect: {
      vectorMultiSelectBoxRef: 'boxRef',
      vectorMultiSelectResizeDragRef: 'resizeRef',
      vectorMultiSelectRotateDragRef: 'rotateRef',
    },
  },
  event: { shiftKey },
  point: { x: 5, y: 5 },
  viewport: 'viewport',
});
