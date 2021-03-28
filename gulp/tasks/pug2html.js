const gulp = require('gulp')
const plumber = require('gulp-plumber')
const pug = require('gulp-pug')
const pugLinter = require('gulp-pug-linter')
const htmlValidator = require('gulp-w3c-html-validator')
const bemValidator = require('gulp-html-bem-validator')
const config = require('../config')

module.exports = function pug2html() {
  return gulp.src(["src/**/*.pug", "!src/**/_*.pug"])
    .pipe(plumber())
    // .pipe(pugLinter({ reporter: 'default' }))
    .pipe(pug({ 
      pretty: config.pug2html.beautifyHtml,
      data: {
        mode: process.env.NODE_ENV
      }
    }))
    .pipe(htmlValidator())
    // .pipe(bemValidator())
    .pipe(gulp.dest('build'))
}

