import {
  Body,
  Controller,
  Get,
  Post,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';

const ORG_ID = process.env.MASHUB_ORG_ID || 'c980d2ea-c536-48f8-b23e-9fa837ce3b5e';

const DEFAULT_SETTINGS: Record<string, any> = {
  instagram: { __type: 'instagram', post_type: 'post' },
  facebook: { __type: 'facebook' },
  tiktok: { __type: 'tiktok', privacy_level: 'PUBLIC_TO_EVERYONE' },
  youtube: { __type: 'youtube' },
  linkedin: { __type: 'linkedin' },
  x: { __type: 'x' },
  gmb: { __type: 'gmb' },
};

@ApiTags('MasHub')
@Controller('/mashub')
export class MashubController {
  constructor(
    private _postsService: PostsService,
    private _integrationService: IntegrationService
  ) {}

  private validateApiKey(apiKey: string | undefined) {
    const expected = process.env.MASHUB_API_KEY;
    if (!expected || !apiKey || apiKey !== expected) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('/integrations')
  async getIntegrations(@Headers('x-mashub-key') apiKey: string) {
    this.validateApiKey(apiKey);
    return this._integrationService.getIntegrationsList(ORG_ID);
  }

  @Post('/draft')
  async createDraft(
    @Headers('x-mashub-key') apiKey: string,
    @Body()
    body: {
      posts: Array<{
        integrationId: string;
        content: string;
        image?: string[];
      }>;
      date?: string;
    }
  ) {
    this.validateApiKey(apiKey);

    if (!body.posts || body.posts.length === 0) {
      throw new HttpException('posts array is required', HttpStatus.BAD_REQUEST);
    }

    const groupId = `mashub-${Date.now()}`;
    const publishDate = body.date || new Date(Date.now() + 86400000).toISOString();

    // Resolve providerIdentifier for each integration to set default settings
    const integrations = await this._integrationService.getIntegrationsList(ORG_ID);
    const integrationMap = new Map(integrations.map((i: any) => [i.id, i.providerIdentifier]));

    const createPostDto = {
      type: 'draft' as const,
      date: publishDate,
      shortLink: false,
      inter: undefined,
      tags: [],
      posts: body.posts.map((p) => {
        const provider = integrationMap.get(p.integrationId) || '';
        return {
          integration: { id: p.integrationId },
          value: [
            {
              content: p.content.startsWith('<') ? p.content : `<p>${p.content}</p>`,
              image: (p.image || []).map((url: string) => ({ id: '', path: url })),
            },
          ],
          group: groupId,
          settings: DEFAULT_SETTINGS[provider] || {},
        };
      }),
    };

    const mapped = await this._postsService.mapTypeToPost(
      createPostDto as any,
      ORG_ID,
      true
    );
    mapped.type = 'draft';

    const result = await this._postsService.createPost(ORG_ID, mapped);
    return {
      success: true,
      group: groupId,
      drafts: result,
      message: `${body.posts.length} draft(s) created. Review in Postiz UI.`,
    };
  }
}
