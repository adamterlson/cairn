export default function (styles) {
  return function(query, toggle) {
    let parts = query.split(' ');
    return parts
      .reduce((arr, selector) => {
        // Handle conditional selectors
        if (selector[selector.length-1] === '?') {
          // Toggling off conditional selectors, so skip this one
          if (!toggle) return arr;

          // Toggling on conditional selectors, so remove the '?'
          selector = selector.slice(0, -1);
        }

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
};

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