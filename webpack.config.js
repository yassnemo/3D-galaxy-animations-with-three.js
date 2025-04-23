const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: '',  // Change from '/' to empty string for relative paths
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.json$/,
                type: 'asset/resource',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    devtool: 'inline-source-map',
    devServer: {
        static: [
            { directory: path.join(__dirname, 'public') },
            { directory: path.join(__dirname, 'dist') }
        ],
        hot: true,
    },
};