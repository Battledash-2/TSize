const size = require('./').size();
const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras porttitor id nisl in mollis. Sed sed fringilla ante. Quisque tincidunt volutpat dolor a lacinia. Pellentesque dapibus ultrices egestas. Maecenas vehicula eros non felis eleifend sagittis. Cras interdum rutrum faucibus. Vestibulum bibendum dictum urna vel euismod. Vestibulum vel interdum nisl.`;

const linesInText = text.length / size.width;
console.log('There are', Math.floor(linesInText)+1, 'newlines in text', '\n\n'+text);