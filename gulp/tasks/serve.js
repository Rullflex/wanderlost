const gulp = require('gulp')

const imageMinify = require('./imageMinify')
const svgSprite = require('./svgSprite')
const styles = require('./styles')
const pug2html = require('./pug2html')
const script = require('./script')
const copyDependencies = require('./copyDependencies')

const server = require('browser-sync')

function readyReload(cb) {
  server.reload()
  cb()
}

function readyStream(cb) {
  server.stream()
  cb()
}

module.exports = function serve(cb) {
    // server.init({
    //     server: 'build',
    //     notify: false,
    //     open: true,
    //     cors: true
		// })
		server({
			server: {
				baseDir: 'build'
			},
			notify: false,
			// open: false,
			// online: false, // Work Offline Without Internet Connection
			// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
		})

    gulp.watch('src/**/*.{gif,png,jpg,svg,webp}', gulp.series(imageMinify, readyReload))
    gulp.watch('src/*svgsprite/*.svg', gulp.series(svgSprite, readyReload))
    // gulp.watch('src/**/*.scss', gulp.series(styles, cb => gulp.src('build/css').pipe(server.stream()).on('end', cb)))
    gulp.watch('src/**/*.scss', styles)
    gulp.watch('src/**/*.js', gulp.series(script, readyReload))
    gulp.watch('src/**/*.pug', gulp.series(pug2html, readyReload))

    gulp.watch('package.json', gulp.series(
      // copyDependencies, 
      readyReload))

    return cb()
}
