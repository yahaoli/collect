var gulp = require('gulp');
/*var babel = require('gulp-babel')
var webpackStream = require('webpack-stream')*/
const path = require('path');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
const autoprefix = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const gUtil = require('gulp-util');
let mainConfig = {
  mode: 'none',
  entry: {
    main: path.join(__dirname, './src/test.js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, './dist/webpack'),
  },
  resolve: {
    extensions: ['.js', '.json', '.node'],
  },
};
gulp.src([
  './src/js/*.js',
]).pipe(uglify())
  .on('error', function (err) {
    gUtil.log(gUtil.colors.red('[Error]'), err.toString());
  })
  .pipe(rename({
    suffix: '.min' //rename只是给上一步骤产出的压缩的styles.css重命名为style.min.css
  }))
  .pipe(gulp.dest('./dist/js/'))
  .on('end', function() {
    console.log('构建完成');
  });
gulp.src(['./src/css/*.css'])
  .pipe(cssmin())
  .pipe(autoprefix({
    overrideBrowserslist: ['last 2 versions'],
    cascade: false,
  }))
  .pipe(rename({
    suffix: '.min' //rename只是给上一步骤产出的压缩的styles.css重命名为style.min.css
  }))
  .pipe(gulp.dest('./dist/css'))
  .on('end', function() {
    console.log('构建完成');
  });
