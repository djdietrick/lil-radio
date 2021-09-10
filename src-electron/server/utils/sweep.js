import path from 'path';
import {execFile} from 'child_process';

export function sweepDir(dir) {
    return new Promise((resolve, reject) => {
        let cb = (err, stdout, stderr) => {
            console.log(stdout);
            if(err) {
                console.log(`Error: ${err}`)
                console.log(`Error: ${stderr}`);
            }
            console.log(`Finished sweeping ${dir}!`);
            resolve();
        }
    
        console.log(`Sweeping directory ${dir}`);
    
        if(process.platform === 'win32') {
            execFile(path.join(__dirname, '../../../rust/target/release/lil-radio-rust.exe'),
                [path.join(__dirname, '../../sql/db/test.db'), dir], cb);
        } else {
            execFile(path.join(__dirname, '../../../rust/target/release/lil-radio-rust'),
                [path.join(__dirname, '../../sql/db/test.db'), dir], cb);
        }
    })
} 