export const filters = {
  normal: 'none',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(100%)',
  invert: 'invert(100%)',
  blur: 'blur(2px)',
  brightness: 'brightness(150%)',
  contrast: 'contrast(200%)',
  saturate: 'saturate(200%)',
  'hue-rotate': 'hue-rotate(90deg)',
};

export type FilterType = keyof typeof filters;

export const applyFilterToContext = (ctx: CanvasRenderingContext2D, filter: FilterType) => {
  if (filter === 'normal') {
    ctx.filter = 'none';
    return;
  }
  ctx.filter = filters[filter];
};
