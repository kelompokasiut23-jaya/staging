export const afterWords = (text: string, step = 0.07) =>
  Math.min(0.9, 0.25 + text.split(" ").length * step)
