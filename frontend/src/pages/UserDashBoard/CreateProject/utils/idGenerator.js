// ============================================
export const generateProjectID = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `PRJ${random}`;
};

export const generateComID = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `COM${random}`;
};