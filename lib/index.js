let Cairn = {
  style: function (styles) {
    return function(query, toggle) {
      let parts = query.split(' ');
      return parts
        .reduce((arr, selector) => {
          // Add conditional selector support
          selector = conditionalSelector(selector, toggle);

          if (!selector) return arr;

          // Expand out dot notation syntax
          arr = arr.concat(dotExpander(selector));

          return arr;
        }, [])
        .map(part => {
          let style = styles[part];
          if (!style) {
            console.warn('Missing style definition for: ', part)
          }
          return style;
        })
        .filter(style => style);
    };
  },
  pile: function (name, sheet, pile = {}) {
    Object.keys(sheet).forEach(className => {
      let styles = {};

      Object.keys(sheet[className]).forEach(attribute => {
        let value = sheet[className][attribute];
        if (value != null && typeof value === 'object') {
          Cairn.pile([name, className].join('.'), { [attribute]: value }, pile);
        } else {
          styles[attribute] = value;
        }
      });

      pile[[name, className].join('.')] = styles;
    });
    console.log('pile', pile);
    return pile;
  }
};

export default Cairn;

function conditionalSelector(selector, toggle) {
  let usingToggleHash = toggle != null && Object.keys(toggle).length !== 0;
  let selectorParts = selector.split('?');

  // The selector is conditional
  if (selectorParts.length > 1) {
    let toggleHashKey = selectorParts[1] || selectorParts[0];

    if (!usingToggleHash) {
      // Toggling all conditional selectors
      if (!toggle) return;
    } else {
      // Toggleing based on a specific hash key
      if (!toggle[toggleHashKey]) return;
    }
  }

  return selectorParts[0];
}

// Expand out the individual selector components based on form
function selectorReducer(arr, selector) {
  if (selector[selector.length-1] === '?') {

  }
  arr = arr.concat(dotExpander(selector));
  return arr;
}

// Convert from "foo.bar.baz" to ["foo", "foo.bar", "foo.bar.baz"]
function dotExpander(selector) {
  let expanded = [];
  let base = '';
  selector.split('.').forEach(segment => {
    let part = base ? [base, segment].join('.') : segment;
    expanded.push(part);
    base = part;
  });
  return expanded;
};