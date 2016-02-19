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

export function variables(variables) {
    let regex = /\$([\w]*)/g;
    let match;

    return styles => {
        Object.keys(styles).forEach(selector => {
            let attributes = styles[selector];
            Object.keys(attributes).forEach(attribute => {
                let value = attributes[attribute];

                if (typeof value !== 'string') {
                    return;
                }
                if (value.indexOf('$') === -1) {
                    return;
                }

                while (match = regex.exec(value)) {
                    let [variableString, variableName] = match;
                    value = value.replace(variableString, variables[variableName]);
                }

                attributes[attribute] = value;
            });
        });

        return styles;
    };
}
