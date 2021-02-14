import * as child_process from "child_process";

export interface ProcessManager {
    startCommand(
        cmd: string,
        options: child_process.ExecOptions,
        callback: (
            error: child_process.ExecException | null,
            stdout: string,
            stderr: string
        ) => void
    ): string;

    startFileExecCommand(
        fileToExec: string, args: string[],
        options: child_process.ExecOptions,
        callback: (
            error: child_process.ExecException | null,
            stdout: string,
            stderr: string
        ) => void
    ): string;

    startInterval(callback: (...args: any[]) => void, ms: number): string;

    end(id: string): void;

    endAll(): void;

    readonly processesAreKilled: boolean;
}

/**
 * An API for managing event-loop and concurrent processes.
 */
export class ProcessManagerImpl implements ProcessManager {
    private constructor() {
        this.processesAreKilled = false;
        this.runningIntervals = {};
        this.intervalCount = 0;

        this.runningCommands = {};
        this.commandCount = 0;
    }

    /**
     * Creates a new instance of a process manager.
     */
    static init(): ProcessManager {
        return new ProcessManagerImpl();
    }

    /**
     * If true, then processes are being killed.
     */
    processesAreKilled: boolean;

    private runningIntervals: Record<string, NodeJS.Timeout>;
    private intervalCount: number;

    private runningCommands: Record<string, child_process.ChildProcess>;
    private commandCount: number;

    /**
     * Starts and runs a command on a separate process, and returns the id associated with that process.
     * @param cmd
     * @param options
     * @param callback
     */
    startCommand(
        cmd: string,
        options: child_process.ExecOptions,
        callback: (
            error: child_process.ExecException | null,
            stdout: string,
            stderr: string
        ) => void
    ): string {
        this.processesAreKilled = false;
        const id = `command_${this.commandCount}`;
        this.runningCommands[id] = child_process.exec(cmd, options,
            (err, stdout, stderr) => {
            delete this.runningCommands[id];
            this.commandCount--;
            callback(err, stdout, stderr);
        });
        this.commandCount++;
        return id;
    }

    startFileExecCommand(
        fileToExec: string,
        args: string[],
        options: child_process.ExecOptions,
        callback: (
            error: child_process.ExecException | null,
            stdout: string,
            stderr: string
        ) => void
    ): string {
        this.processesAreKilled = false;
        const id = `command_${this.commandCount}`;
        this.runningCommands[id] = child_process.execFile(fileToExec, args, options, (error, stdout, stderr) => {
            delete this.runningCommands[id];
            this.commandCount--;
            callback(error, stdout, stderr);
        });
        this.commandCount++;
        return id;
    }

    /**
     * Runs a callback function at every given interval, and returns the id associated with that interval.
     * @param callback
     * @param ms Number of milliseconds for the interval
     */
    startInterval(callback: (...args: any[]) => void, ms: number): string {
        this.processesAreKilled = false;
        const id = `interval_${this.intervalCount}`;
        this.runningIntervals[id] = setInterval(callback, ms);
        this.intervalCount++;
        return id;
    }

    private endInterval(id: string) {
        if (this.runningIntervals[id] != null) {
            clearInterval(this.runningIntervals[id]);
            delete this.runningIntervals[id];
            this.intervalCount--;
        }
    }

    private endCommand(id: string) {
        if (this.runningCommands[id] != null) {
            if (!this.runningCommands[id].killed) {
                this.runningCommands[id].kill('SIGKILL');
            }
            delete this.runningCommands[id];
            this.commandCount--;
        }
    }

    /**
     * Ends a command or interval given the id.
     * @param id
     */
    end(id: string): void {
        const processType = id.substring(0, id.indexOf("_"));
        switch (processType) {
            case "interval":
                return this.endInterval(id);
            case "command":
                return this.endCommand(id);
        }
    }

    /**
     * Ends all running commands and intervals.
     */
    endAll(): void {
        this.processesAreKilled = true;
        Object.keys(this.runningCommands).forEach((cmdId) => {
            if (!this.runningCommands[cmdId].killed)
                this.runningCommands[cmdId].kill();
        });
        Object.keys(this.runningIntervals).forEach((intervalId) => {
            clearInterval(this.runningIntervals[intervalId]);
        });
        this.runningIntervals = {};
        this.runningCommands = {};
        this.commandCount = 0;
        this.intervalCount = 0;
    }
}
