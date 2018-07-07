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
    private current_task = 0;
    private current_subscription;
    private exec_timer;

    constructor(private commends: Commentd[]) {}

    run() {
        this.current_task = 0;

        if (this.running_process) {
            this.running_process.kill();
        } else {
            this.exec();
        }
    }

    runWithInterval(interval=0) {
        if (this.exec_timer) clearTimeout(this.exec_timer);

        this.exec_timer = setTimeout(() => {
            this.run();
        }, interval)
    }


    private exec(): void {
        this.current_subscription = Observable.create((observer: Observer<any>) => {
            let commend = this.commends[this.current_task];
            if (!commend) return;

            this.running_process = exec(commend.cmd, (err, stdout, stdin) => {
                this.safeCall(commend.onDone, err, stdout, stdin);
                if (!err) {
                    this.current_task++;
                    observer.next({});
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

