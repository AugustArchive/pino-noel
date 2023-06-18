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
        target: '../dist/index.js',
        options: {
            json: true
        }
    }
});

const log2 = pino({
    name: 'test logger #2',
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

log2.info('woof');

function c() {
    function d() {
        log2.error('what the fuck');

        function e() {
            log2.fatal({ err: new Error('does this work?') });
        }

        e();
    }

    d();
    log2.warn({ hello: 'world' }, 'what now');
}

c();
