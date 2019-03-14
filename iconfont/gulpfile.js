var gulp = require('gulp');
var iconfont = require('gulp-iconfont');

var iconfontCss = require('gulp-iconfont-css');

var template = require('gulp-template');
var fs = require('fs');

var icons = fs.readdirSync('./src/svg');
icons = icons.map(function(icon) {
    return icon.replace(/\.\w+$/, '');
});

var cssName = 'iconfont'; //生成的css名称
gulp.task('icon', function() {
    return gulp
        .src([`./src/svg/*.svg`])

        .pipe(
            iconfontCss({
                fontName: 'iconfont', // iconfont.css的font-family值
                path: `./src/style/iconfont.template.less`, //css模版文件
                targetPath: `./${cssName}.css`, //css生成文件
                fontPath: './' //iconfont.template.less文件中的fontPath
            })
        )
        .pipe(
            iconfont({
                fontName: 'iconfont',
                formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
                normalize: true
            })
        )
        .pipe(gulp.dest(`./dist`)); //svg的字体文件存放位置
});

gulp.task('example', function() {
    gulp.src(`./src/example/index.html`) //样式例子文件
        .pipe(template({ icons: icons, cssName: cssName }))
        .pipe(gulp.dest(`./dist`)); //样式例子文件存放位置
});
gulp.task('clean',function () {
    const  pathImg='./dist'
    if (fs.existsSync(pathImg)) {
        let files = fs.readdirSync(pathImg);
        files.forEach(function (file, index) {
            var curPath = pathImg + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                fs.rmdirSync(pathImg);
            } else { // delete file
                fs.unlinkSync(curPath,function (err) {
                    if (err) throw err;
                });
            }
        });
        fs.rmdirSync(pathImg);
    }
})
gulp.task('default', ['clean','icon','example']);