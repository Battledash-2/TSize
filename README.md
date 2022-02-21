# TSize
 Efficiently get the terminal size. (Info: if the terminal size is not available, it will assume the terminal is 'read-only' and give Infinity)

### Usage:
```js
const tsize = require('tsize');

const size = tsize.size();
console.log('The terminal is ',
					size.width, ' in width and',
					size.height, ' in height.');
```