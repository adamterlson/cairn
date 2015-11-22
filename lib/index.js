let Cairn = {
  style: function (sheet, options = { spread: true }) {
    return function(query, toggle, inline = []) {
      if (Array.isArray(toggle)) {
        inline = toggle;
        toggle = null;
      }

      let parts = query.split(' ');
      let style = parts
        .reduce((arr, selector) => {
          // Add conditional selector support
          selector = conditionalSelector(selector, toggle);

          if (!selector) return arr;

          // Expand out dot notation syntax
          arr = arr.concat(dotExpander(selector));

          return arr;
        }, [])
        .map(part => {
          let style = sheet[part];
          if (!style) {
            console.warn('Missing style definition for: ', part)
          }
          return style;
        })
        .filter(style => style);

      style = [...style, ...inline];

      if (options && options.spread) {
        return { style };
      }
      
      return style;
    };
  },

  pile: function (name, sheet, pile = {}) {
    if (!sheet) {
      sheet = name;
      name = '';
    }

    Object.keys(sheet).forEach(className => {
      let styles = {};

      Object.keys(sheet[className]).forEach(attribute => {
        let value = sheet[className][attribute];
        if (isNestedElement(attribute, value)) {
          Cairn.pile(Cairn._makeName(name, className), { [attribute]: value }, pile);
        } else {
          styles[attribute] = value;
        }
      });

      pile[Cairn._makeName(name, className)] = styles;
    });

    return pile;
  },

  _makeName: function (...names) {
    return names
      .filter(name => name)
      .join('.');
  }
};

export default Cairn;

// The property names which can be styled via an object in RN
let RESERVED_WORDS = ['shadowOffset'];

function isNestedElement(attribute, value) {
  return RESERVED_WORDS.indexOf(attribute) === -1 &&
         value != null && 
         !Array.isArray(value) && 
         typeof value === 'object'
}

// If the selector is conditional, return it based on toggle
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
      // Toggling based on a specific hash key
      if (!toggle[toggleHashKey]) return;
    }
  }

  return selectorParts[0];
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