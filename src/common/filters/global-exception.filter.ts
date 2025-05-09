import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    
    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
      } else {
        message = exceptionResponse || exception.message;
      }
    } else if (exception instanceof Error) {
      // For other exceptions, get the message but maintain 500 status
      message = exception.message;
      console.error(`Error processing request: ${exception.stack}`);
    }
    
    // Log the error
    console.error(`Exception: ${request.method} ${request.url}`, exception);
    
    // Check if the request is an API call or a web page request
    const isApiRequest = request.url.startsWith('/api') || 
                         request.headers['accept']?.includes('application/json');
    
    if (isApiRequest) {
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: message,
      });
    } else {
      // For web requests, render an error page with a fallback to a simple HTML response
      try {
        return response.status(status).render('pages/error', {
          status,
          message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      } catch (renderError) {
        // If rendering fails, fall back to a basic HTML response
        console.error('Error rendering error page:', renderError);
        const htmlErrorPage = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Error - ${status}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; }
                .error-container { max-width: 800px; margin: 50px auto; padding: 20px; }
                .error-code { font-size: 72px; color: #e74c3c; margin-bottom: 20px; }
                .error-message { font-size: 24px; margin-bottom: 30px; }
                .back-button { display: inline-block; padding: 10px 20px; background-color: #3498db; 
                               color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-code">${status}</div>
                <div class="error-message">${message}</div>
                <a href="/" class="back-button">Back to Home</a>
            </div>
        </body>
        </html>
        `;
        return response.status(status).send(htmlErrorPage);
      }
    }
  }
}