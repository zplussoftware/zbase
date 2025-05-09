import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Use cookie-parser middleware
  app.use(cookieParser());
  
  // Set up EJS view engine
  app.setViewEngine('ejs');
  
  // Determine the correct views directory based on whether we're in production or development
  const viewsPath = join(__dirname, '..', process.env.NODE_ENV === 'production' ? 'src/views' : 'src/views');
  app.setBaseViewsDir(viewsPath);
  
  // Serve static files - also adjust for production or development
  const staticPath = join(__dirname, '..', process.env.NODE_ENV === 'production' ? 'src/public' : 'src/public');
  app.useStaticAssets(staticPath);
  
  await app.listen(3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Views directory: ${viewsPath}`);
  console.log(`Static assets directory: ${staticPath}`);
}

bootstrap();