const path = require('path')

module.exports = {
    mode: 'production',
    entry: './dist/src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: {
            name: 'resq',
            type: 'umd',
            export: 'default',
        },
        globalObject: 'this',
    },
    resolve: {
        extensions: ['.js'],
    },
    externals: {},
}
