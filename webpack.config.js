const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        clean: true
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {test: /\.txt$/, use: 'raw-loader'}
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "TheTest",
            template: path.resolve(__dirname, "src/index.html"),
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, "public")
        },
        compress: true,
        port: 5000,
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.css'],
    },

}