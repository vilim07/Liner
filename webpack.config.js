const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
var webpack = require('webpack');



module.exports = {
    mode: "development",
    entry: './src/index.js',
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
        
    ],
    output:{
        filename: 'script.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    devServer: {
        static:{
            directory : path.resolve(__dirname, "dist")
        },
        hot: true,
        port: 3000
    },
    module:{
        rules: [
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.html$/,
                use: ["html-loader"]
            },
            {
                test: /\.(svg|png|jpg|gif)$/,
                type: "asset/resource",
                generator: {
                    filename: 'assets/img/[hash][ext][query]'
                }
            },
            {
                test: /\.(woff|woff2)$/,
                type: "asset/resource",
                generator: {
                    filename: 'assets/font/[hash][ext][query]'
                }
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
};
