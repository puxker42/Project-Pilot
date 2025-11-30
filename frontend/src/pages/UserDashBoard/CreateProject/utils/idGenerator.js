// ============================================
export const generateProjectID = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PRJ${random}`;
};

export const generateComID = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `COM${random}`;
};