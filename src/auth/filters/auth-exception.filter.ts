import { Injectable, UnauthorizedException, ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Kiểm tra nếu request có accept header là text/html thì chuyển về trang login
    const acceptHeader = request.headers.accept || '';
    
    if (acceptHeader.includes('text/html')) {
      // Đây là request từ trình duyệt, chuyển hướng đến trang đăng nhập
      return response.redirect('/login');
    }
    
    // Đây là API request, trả về JSON error
    response.status(401).json({
      statusCode: 401,
      message: exception.message || 'Unauthorized',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}