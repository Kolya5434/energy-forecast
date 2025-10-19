export const getHeatmapColor = (value: number, min: number, max: number) => {
  const normalized = (value - min) / (max - min);
  const hue = (1 - normalized) * 240; // Blue (240) to Red (0)
  return `hsl(${hue}, 70%, 50%)`;
};