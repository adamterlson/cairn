export function combineTransformers(...transformers) {
  if (!transformers || !transformers.length) {
    throw new Error('No transformers provided');
  }

  return (sheet) => 
    transformers.reduce(
      (result, transformer) => transformer(result), 
      sheet
    );
};