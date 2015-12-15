export function style(sheet) {
  console.log('sheet', sheet);
  return function(query, toggle, inline = []) {
    if (Array.isArray(toggle)) {
      inline = toggle;
      toggle = null;
    }

    let parts = query.split(' ');
    let selectors = parts
      .reduce((arr, selector) => {
        // Add conditional selector support
        selector = conditionalSelector(selector, toggle);

        if (!selector) return arr;

        // Expand out dot notation syntax
        arr = arr.concat(dotExpander(selector));

        return arr;
      }, []);

    // Compile styles
    let style = selectors
      .map(selector => {
        let style = sheet.styles[selector];
        if (!style) {
          console.warn('Missing style definition for: ', selector)
        }
        return style;
      })
      .filter(style => style);

    // Compile props
    let props = selectors
      .reduce((props, selector) => {
        if (!sheet.props) return props;

        return Object.assign(props, sheet.props[selector]);
      }, {});

    style = [...style, ...inline];

    props.style = style;

    return props;
  };
};

export function pile(name, sheet, flattened = {}, props = {}) {
  if (!sheet) {
    sheet = name;
    name = '';
  }

  Object.keys(sheet).forEach(className => {
    let styles = {};

    Object.keys(sheet[className]).forEach(attribute => {
      let value = sheet[className][attribute];
      if (attribute === 'props') {
        props[makeName(name, className)] = value;
      } else if (isNestedElement(attribute, value)) {
        pile(makeName(name, className), { [attribute]: value }, flattened, props);
      } else {
        styles[attribute] = value;
      }
    });

    flattened[makeName(name, className)] = styles;
  });

  return { styles: flattened, props };
};

export default function(sheet) {
  return style(pile(sheet));
};

function makeName(...names) {
  return names
    .filter(name => name)
    .join('.');
}

// The property names which can be styled via an object in RN
let RESERVED_WORDS = ['shadowOffset', 'props'];

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