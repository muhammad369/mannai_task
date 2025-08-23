import { Injectable } from '@angular/core';

export interface LogEntry {
    level: 'log' | 'error' | 'warn' | 'info';
    message: string;
    data?: any;
    timestamp: Date;
    context?: string;
}

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    log(message: string, data?: any, context?: string): void {
        this.addLog('log', message, data, context);
    }

    error(message: string, data?: any, context?: string): void {
        this.addLog('error', message, data, context);
    }

    warn(message: string, data?: any, context?: string): void {
        this.addLog('warn', message, data, context);
    }

    info(message: string, data?: any, context?: string): void {
        this.addLog('info', message, data, context);
    }



    private addLog(level: LogEntry['level'], message: string, data?: any, context?: string): void {
        const logEntry: LogEntry = {
            level,
            message,
            data,
            timestamp: new Date(),
            context
        };

       
        // Also log to console based on level
        this.logToConsole(logEntry);
    }

    private logToConsole(entry: LogEntry): void {
        const timestamp = entry.timestamp.toISOString();
        const context = entry.context ? `[${entry.context}]` : '';
        const message = `${timestamp} ${context} ${entry.message}`;

        switch (entry.level) {
            case 'error':
                console.error(message, entry.data);
                break;
            case 'warn':
                console.warn(message, entry.data);
                break;
            case 'info':
                console.info(message, entry.data);
                break;
            default:
                console.log(message, entry.data);
        }
    }
}