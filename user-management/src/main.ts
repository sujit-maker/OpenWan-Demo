 import { NestFactory } from '@nestjs/core';
 import { AppModule } from './app.module';
 import { ValidationPipe } from '@nestjs/common';
  
 async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.NEST_APP_PORT || 8000, '0.0.0.0');
}
  
bootstrap();
 