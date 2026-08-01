import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import mikroOrmConfig from './mikro-orm.config';
import { PresentationModule } from './presentation/presentation.module';

@Module({
  imports: [MikroOrmModule.forRoot(mikroOrmConfig), PresentationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
