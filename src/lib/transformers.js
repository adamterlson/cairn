/**
 * Combine together multiple transformers into one
 *
 * compose(
 *   transformerOne,
 *   transformerTwo,
 *   compose(
 *     transformerThree,
 *     transformerFour
 *   )
 * )
 */
export function compose(...transformers) {
  if (!transformers || !transformers.length) {
    throw new Error('No transformers provided');
  }

  return (sheet) => 
    transformers.reduce(
      (result, transformer) => transformer(result), 
      sheet
    );
};

/**
 * Add support for variables in the form:
 * 
 * {
 *   prop: '$variable'
 * }
 */

export function variables(variables) {
  if (!variables) {
    throw new Error('No variables provided');
  }

  function getVariableValue(value) {
    const reg =  /\$([\w]*)/;
    const [fullMatch, variableName] = reg.exec(value);
    const varValue = variables[variableName];

    // Variable present, but not declared, return original
    if (varValue == null) {
      return value;
    }

    // The variable is the only thing, use the variable as the value
    if (fullMatch.length === value.length) {
      return varValue;
    }

    // There's other stringy stuff, just replace the value in the string
    return value.replace(fullMatch, varValue);
  }

  return styles => {
    Object.keys(styles).forEach(selector => {
      const attributes = styles[selector];

      Object.keys(attributes).forEach(attribute => {
        const value = attributes[attribute];

        // It's not a string, bail
        if (typeof value !== 'string') {
          return;
        }
        
        // No variables present in said string, bail
        if (value.indexOf('$') === -1) {
          return;
        }

        attributes[attribute] = getVariableValue(value);
      });
    });

    return styles;
  };
}