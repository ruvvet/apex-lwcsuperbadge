# Notes:

### renderedCallback() vs connectedCallback()
- connectedCallback()
  - can fire more than once
  - The connected callback is executed when the component is inserted into DOM. Connected callback runs once when the component is inserted.
  - Executes when component is loaded
  - Execution flow = parent > child. Cannot access child elements because they have not rendered yet

- renderedCallback()
  - use when there is logic that needs to be performed after a component is done rendering
  - This gets called when the component is rendered. Basically when all the elements on the component are inserted.
  - Re-renders when any property/data being passed in is changed.
  - Execution flow = child > parent. renderedcallbacks of all children are executed before parent

### LWC vs Aura
 - LWC <c-custom-component> === Aura:
 - LWC can be nested inside aura, but aura cannot be nested inside an LWC
 - LWC is better because its built on top of web features and has better performance

### Importing a 3rd party library
  1. add the lib to a static resource
  2. add sattic resource to component

### share JS code between LWC + Aura
 - create ES6 module with code
 - then import and reference in the components JS file