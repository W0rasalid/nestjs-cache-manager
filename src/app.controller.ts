import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RespUserDto } from './dto/response';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Get('user')
  getUser(): Promise<RespUserDto> {
    return this.appService.getUser();
  }
}
