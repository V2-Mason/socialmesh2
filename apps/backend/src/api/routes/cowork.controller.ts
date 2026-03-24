import {
  Body,
  Controller,
  Get,
  Post,
  Headers,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';

@ApiTags('CoWork')
@Controller('/cowork')
export class CoworkController {
  constructor(private _postsService: PostsService) {}

  private validateApiKey(apiKey: string | undefined) {
    const expected = process.env.COWORK_API_KEY;
    if (!expected || !apiKey || apiKey !== expected) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('/queue')
  async getQueue(@Headers('x-cowork-key') apiKey: string) {
    this.validateApiKey(apiKey);
    return this._postsService.getCoworkQueue();
  }

  @Post('/result')
  async postResult(
    @Headers('x-cowork-key') apiKey: string,
    @Body()
    body: {
      postId: string;
      status: 'success' | 'error';
      releaseURL?: string;
      platformPostId?: string;
      error?: string;
      screenshotPath?: string;
    }
  ) {
    this.validateApiKey(apiKey);
    return this._postsService.processCoworkResult(body);
  }

  @Post('/publishing')
  async markPublishing(
    @Headers('x-cowork-key') apiKey: string,
    @Body() body: { postId: string }
  ) {
    this.validateApiKey(apiKey);
    return this._postsService.changeState(body.postId, 'PUBLISHING');
  }
}
