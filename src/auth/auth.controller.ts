import { Controller, Post, Body, UseGuards, Get, Request, Response, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Phương thức đăng nhập không sử dụng LocalAuthGuard để gỡ lỗi
  @Post('login-debug')
  async loginDebug(@Body() loginDto: LoginDto) {
    console.log('================================');
    console.log('LOGIN DEBUG ENDPOINT CALLED');
    console.log('LoginDto received:', JSON.stringify(loginDto));
    console.log('Email field present?', loginDto.email ? 'YES' : 'NO');
    console.log('Password field present?', loginDto.password ? 'YES' : 'NO');
    
    try {
      // Xác thực thủ công thông qua AuthService
      console.log('Calling authService.validateUser with:', loginDto.email);
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      console.log('AuthService.validateUser returned:', user ? JSON.stringify(user) : 'null');
      
      if (!user) {
        console.log('Authentication failed - user is null');
        throw new UnauthorizedException('Invalid email or password');
      }
      
      // Tạo JWT token
      console.log('Generating JWT token for user');
      const result = await this.authService.login(user);
      console.log('Login successful, returning token and user data');
      console.log('================================');
      return result;
    } catch (error) {
      console.log('Error during login-debug:', error.message);
      console.log('Error stack:', error.stack);
      console.log('================================');
      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response() res, @Body() loginDto: LoginDto) {
    console.log('AuthController.login called with body:', loginDto);
    console.log('User authenticated in request:', req.user ? 'Yes' : 'No');
    
    // Nếu không có user trong request, đăng nhập thất bại
    if (!req.user) {
      console.log('Authentication failed - no user in request');
    }
    
    const authResult = await this.authService.login(req.user);
    
    // Set JWT token in a cookie
    res.cookie('jwt', authResult.access_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      // secure: true, // Uncomment in production (requires HTTPS)
    });
    
    // Return the response
    return res.json(authResult);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Response() res) {
    const authResult = await this.authService.register(createUserDto);
    
    // Set JWT token in a cookie
    res.cookie('jwt', authResult.access_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      // secure: true, // Uncomment in production (requires HTTPS)
    });
    
    // Return the response
    return res.json(authResult);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Response() res) {
    // Get the user information for logging
    const userId = req.user.userId || req.user.sub;
    const userName = req.user.name || req.user.email;
    
    // Log logout action
    await this.authService.logout(userId, userName);
    
    // Clear cookie
    res.clearCookie('jwt');
    return res.json({ message: 'Logout successful' });
  }
}