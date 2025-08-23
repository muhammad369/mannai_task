import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
    private logger = inject(LoggerService);

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const startTime = Date.now();

        // Log the request
        this.logRequest(request);

        return next.handle(request).pipe(
            tap({
                next: (event) => {
                    if (event instanceof HttpResponse) {
                        // Log the response
                        this.logResponse(event, request, startTime);
                    }
                },
                error: (error) => {
                    // Log error responses
                    this.logError(error, request, startTime);
                }
            })
        );
    }

    private logRequest(request: HttpRequest<any>): void {
        const logData = {
            type: 'HTTP Request',
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: this.sanitizeBody(request.body),
            timestamp: new Date().toISOString()
        };

        this.logger.log('HTTP Request', logData);

       
    }

    private logResponse(response: HttpResponse<any>, request: HttpRequest<any>, startTime: number): void {
        const duration = Date.now() - startTime;

        const logData = {
            type: 'HTTP Response',
            method: request.method,
            url: request.url,
            status: response.status,
            statusText: response.statusText,
            duration: `${duration}ms`,
            headers: response.headers,
            body: this.sanitizeBody(response.body),
            timestamp: new Date().toISOString()
        };

        this.logger.log('HTTP Response', logData);

      
    }

    private logError(error: any, request: HttpRequest<any>, startTime: number): void {
        const duration = Date.now() - startTime;

        const logData = {
            type: 'HTTP Error',
            method: request.method,
            url: request.url,
            status: error.status || 'Unknown',
            statusText: error.statusText || 'Unknown Error',
            duration: `${duration}ms`,
            error: error.error,
            timestamp: new Date().toISOString()
        };

        this.logger.error('HTTP Error', logData);

       
    }

   

    private sanitizeBody(body: any): any {
        if (!body) return body;

        // Create a deep copy to avoid modifying the original
        const sanitized = JSON.parse(JSON.stringify(body));

        // Remove sensitive data from body
        const sensitiveFields = ['password', 'token', 'secret', 'creditcard', 'cvv', 'ssn'];

        const sanitizeObject = (obj: any) => {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (sensitiveFields.includes(key.toLowerCase())) {
                        obj[key] = '***REDACTED***';
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        sanitizeObject(obj[key]);
                    }
                }
            }
        };

        if (typeof sanitized === 'object') {
            sanitizeObject(sanitized);
        }

        return sanitized;
    }

}