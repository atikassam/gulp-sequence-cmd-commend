# gulp-sequence-cmd-commend
This is a sequential cmd commend runner which runs multiple commends one after one

### example 
```javascript
const { CommendRunner } = require('./dest');
const gulp = require('gulp');
const ts = require('gulp-typescript');

const tsProject = ts.createProject('./tsconfig.json');


const TASK = new CommendRunner([
    // First commend
    {
        cmd: 'npm run build:server' 
        , onDone () {
            console.log('1st');
        }
    }
    
    // Second commend
    , {
        cmd: 'npm run build:client'
        , onDone () {
            console.log('2nd');
        }
    }
    
    // 3rd commend
    , {
        cmd: 'npm run start'
        , onDone () {
            console.log('3rd');
        }
    }
]);

// Restart server on file change 
gulp.task('start:watch', () => {
    
    let watcher = gulp.watch('./src/**/*.ts');
    watcher.on('change', () => TASK.runWithInterval(1500));
    TASK.run()
});


```