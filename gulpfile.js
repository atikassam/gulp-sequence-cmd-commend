const { CommendRunner } = require('./dest');
const gulp = require('gulp');
const ts = require('gulp-typescript');

const tsProject = ts.createProject('./tsconfig.json');

gulp.task('build', () => {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest(tsProject.config.compilerOptions.outDir));
});

const TASK = new CommendRunner([
    {
        cmd: 'npm run build'
        , onDone () {
            console.log('1st');
        }
    }
    , {
        cmd: 'npm run build'
        , onDone () {
            console.log('2nd');
        }
    }
    , {
        cmd: 'npm run build'
        , onDone () {
            console.log('3rd');
        }
    }
]);

// Restart server on file change
gulp.task('start:watch', () => {
    // Run build commend on file change
    let watcher = gulp.watch('./src/**/*.ts');
    watcher.on('change', () => TASK.runWithInterval(3000));
    TASK.run()
});

