import { exec } from "shelljs";
import {Observable} from "rxjs/internal/Observable";
import {Observer} from "rxjs/internal/types";

export interface Commentd {
    cmd: string
    onDone(err, stdout, stdin): void
    onError(err): void
    onData(data): void
    onExit(data): void
}


export class CommendRunner {
    private running_process;
    private current_subscription;
    private exec_timer;
    private reset = false;

    constructor(private commends: Commentd[]) {}

    run() {
        this.reset = true;

        if (this.running_process) {
            this.running_process.kill();
        } else {
            this.exec({ commend_index: 0 });
        }
    }

    runWithInterval(interval=0) {
        if (this.exec_timer) clearTimeout(this.exec_timer);

        this.exec_timer = setTimeout(() => {
            this.run();
        }, interval)
    }


    private exec({ commend_index = 0 }): void {
        this.current_subscription = Observable.create((observer: Observer<any>) => {

            commend_index = this.reset ? 0 : commend_index;

            let commend = this.commends[commend_index];
            if (!commend) return;

            this.running_process = exec(commend.cmd, (err, stdout, stdin) => {
                this.safeCall(commend.onDone, err, stdout, stdin);
                if (!err) {
                    observer.next({ commend_index: commend_index + 1 });
                }

                this.running_process = undefined;
            });

            this.running_process.on('data', (data) => this.safeCall(commend.onData, data));
            this.running_process.on('error', (error) => this.safeCall(commend.onError, error));
            this.running_process.on('exit', (code) => this.safeCall(commend.onExit, code));
        }).subscribe(this.exec.bind(this));
    }


    private safeCall(cb, ...datas): void {
        if (typeof cb === 'function') {
            cb.apply(cb, datas);
        }
    }
}

