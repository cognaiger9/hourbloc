// Color palette for tags
export const TAG_COLORS = [
  '#3CBF6F', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Yellow
  '#F97316', // Orange
  '#E86858', // Red
  '#92400E', // Brown
  '#6B7280', // Grey
];

// Get color for a tag based on its index
export const getTagColor = (index: number): string => {
  return TAG_COLORS[index % TAG_COLORS.length];
};

/**
 * Get tag color styles (color, background, border) from tag color hex
 * @param tagColor - Hex color string (e.g., "#3CBF6F")
 * @returns Object with categoryColor, categoryBg, and categoryBorder
 */
export function getTagColorStyles(tagColor: string) {
  // Convert hex to RGB for opacity calculations
  const hex = tagColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return {
    categoryColor: tagColor,
    categoryBg: `rgba(${r}, ${g}, ${b}, 0.1)`,
    categoryBorder: `rgba(${r}, ${g}, ${b}, 0.3)`,
  };
}

