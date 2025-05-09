import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('LocalStrategy.validate called with email:', email);
    const user = await this.authService.validateUser(email, password);
    console.log('AuthService.validateUser returned:', user ? 'User object' : 'null');
    if (!user) {
      console.log('Throwing UnauthorizedException');
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }
}