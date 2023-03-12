const noelPino = require('../dist');

module.exports = (opts) =>
    noelPino.default({
        ...opts,
        transport: new noelPino.formatters.Default({ targetPadding: 15 })
    });
