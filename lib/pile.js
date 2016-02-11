export default function pile(prefix, sheet, flattened = {}, props = {}) {
  if (!sheet) {
    sheet = prefix;
    prefix = '';
  }

  Object.keys(sheet).forEach(className => {
    let styles = {};

    Object.keys(sheet[className]).forEach(attribute => {
      let value = sheet[className][attribute];
      if (attribute === 'props') {
        if (!isValidProps(value)) {
          throw new Error('Invalid `props` definition');
        }

        props[makeName(prefix, className)] = value;
      } else if (isNestedElement(attribute, value)) {
        pile(makeName(prefix, className), { [attribute]: value }, flattened, props);
      } else {
        styles[attribute] = value;
      }
    });

    if (Object.keys(styles).length > 0) {
      flattened[makeName(prefix, className)] = styles;
    }
  });

  return { styles: flattened, props };
};

// The property names which can be styled via an object in RN
const STYLE_RESERVED_WORDS = ['shadowOffset', 'props'];

// Disallowed words in props definition
const PROPS_RESERVED_WORDS = ['styles'];

function isNestedElement(attribute, value) {
  return STYLE_RESERVED_WORDS.indexOf(attribute) === -1 &&
        value != null &&
        !Array.isArray(value) &&
        typeof value === 'object';
};

function isValidProps(props) {
  return Object.keys(props).reduce((cur, prop) => {
    return cur && PROPS_RESERVED_WORDS.indexOf(prop) === -1;
  }, true);
};

function makeName(...names) {
  return names
    .filter(name => name)
    .join('.');
}