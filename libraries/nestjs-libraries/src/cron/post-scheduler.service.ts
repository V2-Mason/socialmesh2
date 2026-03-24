import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';

@Injectable()
export class PostSchedulerService {
  private readonly logger = new Logger(PostSchedulerService.name);

  constructor(private _prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkScheduledPosts() {
    const now = new Date();

    // Find posts that are due for publishing
    const duePosts = await this._prisma.post.findMany({
      where: {
        state: 'QUEUE',
        publishDate: { lte: now },
      },
      include: {
        integration: true,
      },
    });

    if (duePosts.length === 0) return;

    this.logger.log(`Found ${duePosts.length} due post(s)`);

    for (const post of duePosts) {
      try {
        // Skip disabled integrations
        if (post.integration?.disabled) {
          this.logger.warn(
            `Skipping post ${post.id}: integration ${post.integration.name} is disabled`
          );
          continue;
        }

        // Skip integrations needing refresh
        if (post.integration?.refreshNeeded) {
          this.logger.warn(
            `Skipping post ${post.id}: integration ${post.integration.name} needs reconnection`
          );
          continue;
        }

        // Mark as PENDING_PUBLISH
        await this._prisma.post.update({
          where: { id: post.id },
          data: { state: 'PENDING_PUBLISH' },
        });

        // Also mark child posts (comments/threads)
        await this._prisma.post.updateMany({
          where: { parentPostId: post.id },
          data: { state: 'PENDING_PUBLISH' },
        });

        this.logger.log(
          `Post ${post.id} marked PENDING_PUBLISH (${post.integration?.providerIdentifier})`
        );
      } catch (err) {
        this.logger.error(`Failed to process post ${post.id}:`, err);
      }
    }

    // Send a single Discord notification for all due posts
    await this.notifyCowork(duePosts);
  }

  private async notifyCowork(posts: any[]) {
    const webhookUrl = process.env.COWORK_DISCORD_WEBHOOK;
    if (!webhookUrl) return;

    const platforms = [
      ...new Set(
        posts.map((p) => p.integration?.providerIdentifier || 'unknown')
      ),
    ];

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `📤 **CoWork 发布任务**\n帖子数: ${posts.length}\n平台: ${platforms.join(', ')}\n\n请 CoWork 执行发布。`,
        }),
      });
    } catch (err) {
      this.logger.error('Failed to send Discord webhook:', err);
    }
  }
}
