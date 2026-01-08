module.exports = {
    'presets': [
        [
            '@babel/preset-env',
        ],
        '@babel/preset-typescript',
    ],
    'ignore': [
        '.eslintrc.js',
        'babel.config.js',
        'rollup.config.js',
        'scripts/',
        'node_modules/',
        'dist/',
    ],
    'plugins': [
        ['@babel/plugin-transform-runtime', {
            'regenerator': true,
        }],
    ],
}
