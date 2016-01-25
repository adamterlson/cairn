export function style(sheet) {
  return function(query, toggle, inline = []) {
    if (Array.isArray(toggle)) {
      inline = toggle;
      toggle = null;
    }

    const missing = [];
    const parts = query.split(' ');
    const selectors = parts
      .reduce((arr, selector) => {
        // Add conditional selector support
        selector = conditionalSelector(selector, toggle);

        if (!selector) return arr;

        // Check if selector is invalid
        if (!sheet.styles[selector] && !sheet.props[selector]) {
          console.warn('Missing style and prop definition for: ', selector);
        }

        // Expand out dot notation syntax
        arr = arr.concat(dotExpander(selector));

        return arr;
      }, []);

    // Compile styles
    let style = selectors
      .map(selector => {
        let style = sheet.styles[selector];
        if (!style) {
          missing.push(selector);
        }
        return style;
      })
      .filter(style => style);

    // Compile props
    const props = selectors
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
        if (!isValidProps(value)) {
          throw new Error('Invalid `props` definition');
        }

        props[makeName(name, className)] = value;
      } else if (isNestedElement(attribute, value)) {
        pile(makeName(name, className), { [attribute]: value }, flattened, props);
      } else {
        styles[attribute] = value;
      }
    });

    if (Object.keys(styles).length > 0) {
      flattened[makeName(name, className)] = styles;
    }
  });

  return { styles: flattened, props };
};

export default function(sheet = {}, stylesTransformer = noopTransformer) {
  const stylesAndProps = pile(sheet);

  // Allow the user a chance to convert the styles into a RN stylesheet
  stylesAndProps.styles = stylesTransformer(stylesAndProps.styles);

  return style(stylesAndProps);
};

function noopTransformer(prop) { return prop };

function makeName(...names) {
  return names
    .filter(name => name)
    .join('.');
}

// The property names which can be styled via an object in RN
const STYLE_RESERVED_WORDS = ['shadowOffset', 'props'];

function isNestedElement(attribute, value) {
  return STYLE_RESERVED_WORDS.indexOf(attribute) === -1 &&
         value != null &&
         !Array.isArray(value) &&
         typeof value === 'object'
}

const PROPS_RESERVED_WORDS = ['styles'];

function isValidProps(props) {
  return Object.keys(props).reduce((cur, prop) => {
    return cur && PROPS_RESERVED_WORDS.indexOf(prop) === -1;
  }, true);
}

// If the selector is conditional, return it based on toggle
function conditionalSelector(selector, toggle) {
  const usingToggleHash = toggle != null && Object.keys(toggle).length !== 0;
  const selectorParts = selector.split('?');

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
  const expanded = [];
  let base = '';
  selector.split('.').forEach(segment => {
    const part = base ? [base, segment].join('.') : segment;
    expanded.push(part);
    base = part;
  });
  return expanded;
};
