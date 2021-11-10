import browserSync from 'browser-sync';

import gulp from 'gulp';
import gulpIf from 'gulp-if';
import clean from 'gulp-clean';

import htmlPartial from 'gulp-html-partial';
import htmlMin from 'gulp-htmlmin';
import htmlBeautify from 'gulp-html-beautify';

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import cssMin from 'gulp-cssmin';
import cssBeautify from 'gulp-cssbeautify';

import jsImport from 'gulp-js-import';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

import gulpImagemin from 'gulp-imagemin';

browserSync.create();

const isProd = process.env.NODE_ENV === 'prod';
const sass = gulpSass(dartSass);
const dir = isProd ? 'build' : 'public';

const htmlFile = [
  'src/*.html'
]

export const html = () => {
  return gulp.src(htmlFile)
    .pipe(htmlPartial({
      basePath: 'src/assets/partials/'
    }))
    .pipe(htmlBeautify())
    .pipe(gulpIf(isProd, htmlMin({
      collapseWhitespace: true
    })))
    .pipe(gulp.dest(dir));
}

export const css = () => {
  return gulp.src('src/assets/sass/styles.scss')
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(cssBeautify({
      indent: '  ',
      openbrace: 'separate-line',
      autosemicolon: true
    }))
    .pipe(gulpIf(!isProd, sourcemaps.write()))
    .pipe(gulpIf(isProd, cssMin({
      processImport: false,
    })))
    .pipe(gulp.dest(`${dir}/assets/css/`));
}

export const js = () => {
  return gulp.src('src/assets/js/*.js')
    .pipe(jsImport({
      hideConsole: true
    }))
    .pipe(gulpIf(isProd, uglify()))
    .pipe(gulp.dest(`${dir}/assets/js`));
}

const img = () => {
  return gulp.src('src/assets/img/**/*')
    .pipe(gulpIf(isProd, gulpImagemin()))
    .pipe(gulp.dest(`${dir}/assets/img/`));
}

export const fonts = () => {
  return gulp.src('src/assets/fonts/*.{eot,svg,otf,ttf,woff,woff2}')
    .pipe(gulp.dest(`${dir}/assets/fonts/`));
}


function serveInner() {
  browserSync.init({
    open: true,
    notify: false,
    server: './public'
  });
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}


const watchFiles = () => {
  gulp.watch('src/**/*.html', gulp.series(html, browserSyncReload));
  gulp.watch('src/assets/**/*.scss', gulp.series(css, browserSyncReload));
  gulp.watch('src/assets/**/*.js', gulp.series(js, browserSyncReload));
  gulp.watch('src/assets/img/**/*.*', gulp.series(img));
  gulp.watch('src/assets/**/*.{eot,svg,otf,ttf,woff,woff2}', gulp.series(fonts));

  return;
}

export const del = () => {
  return gulp.src(`${dir}/*`, {read: false})
    .pipe(clean());
}

export const serve = gulp.parallel(html, css, js, img, fonts, watchFiles, serveInner)

export default gulp.series(del, html, css, js, fonts, img)
