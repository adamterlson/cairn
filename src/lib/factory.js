import style, {cacheKey} from './style';
import pile from './pile';

function noopStyler() { return { style: [] }; }
function noopTransformer(prop) { return prop }

function factory(parentStyler, sheet = {}, stylesTransformer, propsTransformer) {
  // Check for null or undefined and set to a noop
  if (stylesTransformer == null) {
    stylesTransformer = noopTransformer;
  }
  if (propsTransformer == null) {
    propsTransformer = noopTransformer;
  }

  const stylesAndProps = pile(sheet);

  // Allow the user a chance to transform the styles (e.g. into a RN stylesheet)
  stylesAndProps.styles = stylesTransformer(stylesAndProps.styles);

  // Allow the user a chance to convert the props
  stylesAndProps.props = propsTransformer(stylesAndProps.props);

  // Generate the styling function for the current sheet
  const currentStyler = style(stylesAndProps);

  // Create a new styling function that will combine together the current sheet with the parent
  const combinedStyler = mergedStyle(parentStyler, currentStyler);

  // Add the extend function for chaining
  combinedStyler.extend = (sheet) => factory(combinedStyler, sheet, stylesTransformer, propsTransformer);

  return combinedStyler;
};

function mergedStyle(...stylers) {
  const cache = {};
  return function (query, toggle, inline = []) {
    if (Array.isArray(toggle)) {
      inline = toggle;
      toggle = null;
    }

    const key = cacheKey(query, toggle);
    if (!inline.length && cache[key]) {
      return cache[key];
    }

    const result = stylers.reduce((prevStylesAndProps, styler) => {
      const currentStylesAndProps = styler(query, toggle);
      return {
        ...prevStylesAndProps,
        ...currentStylesAndProps,
        style: [ ...prevStylesAndProps.style, ...currentStylesAndProps.style ]
      };
    }, { style: [] });

    if (inline.length) {
      result.style = [...result.style, ...inline];
    } else {
      cache[key] = result;
    }

    return result;
  }
}

export default factory.bind(null, noopStyler);
