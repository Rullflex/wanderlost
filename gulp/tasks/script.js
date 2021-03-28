const gulp = require('gulp')
const plumber = require('gulp-plumber')
const webpack = require('webpack-stream')
var named = require('vinyl-named-with-path')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin")
const eslint = require('gulp-eslint')

module.exports = function script() {
  return gulp.src(["src/**/*.js", "!src/**/_*.js"])
    .pipe(plumber())
    // .pipe(eslint())
    // .pipe(eslint.format())
    .pipe(named())
    .pipe(webpack({
      mode: process.env.NODE_ENV,
      output: {
        filename: '[name].min.js',
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },
      plugins: [
        new CircularDependencyPlugin(),
        new DuplicatePackageCheckerPlugin()
      ]
    }))
    .pipe(gulp.dest('build/'))
}

