const { default: pino } = require('pino');
const noelPino = require('../dist');

const log = pino({
  name: 'test logger',
  level: 'trace',
  serializers: {
    err: noelPino.serializers.createErrorSerializer(),
    error: noelPino.serializers.createErrorSerializer()
  },
  transport: {
    target: '../dist/index.js'
  }
});

log.info({ woof: true, error: new Error('heck') }, 'wee woo');
log.warn('humanity is fucked');
log.error('WAFFFFF');
log.fatal('u dun fuc up');
log.debug('woof: true');
log.trace('hecc');

function b() {
  log.error({ error: new TypeError('awwawjsdnajklsadsasd') });
}

b();
