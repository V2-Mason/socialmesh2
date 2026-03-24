import { PostActivity } from '@gitroom/orchestrator/activities/post.activity';
import {
  proxyActivities,
  sleep,
  defineSignal,
  setHandler,
} from '@temporalio/workflow';
import dayjs from 'dayjs';
import { capitalize } from 'lodash';

const {
  getPostsList,
  inAppNotification,
  changeState,
  notifyCowork,
} = proxyActivities<PostActivity>({
  startToCloseTimeout: '10 minute',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 1,
    initialInterval: '2 minutes',
  },
});

const poke = defineSignal('poke');

export async function postWorkflowV101({
  taskQueue,
  postId,
  organizationId,
  postNow = false,
}: {
  taskQueue: string;
  postId: string;
  organizationId: string;
  postNow?: boolean;
}) {
  let poked = false;
  setHandler(poke, () => {
    poked = true;
  });

  // get all the posts and comments to post
  const postsListBefore = await getPostsList(organizationId, postId);
  const [post] = postsListBefore;

  // in case doesn't exists for some reason, fail it
  if (!post || (!postNow && post.state !== 'QUEUE')) {
    return;
  }

  // if it's a repeatable post, we should ignore this.
  if (!postNow) {
    await sleep(
      dayjs(post.publishDate).isBefore(dayjs())
        ? 0
        : dayjs(post.publishDate).diff(dayjs(), 'millisecond')
    );
  }

  // if refresh is needed from last time, let's inform the user
  if (post.integration?.refreshNeeded) {
    await inAppNotification(
      post.organizationId,
      `We couldn't post to ${post.integration?.providerIdentifier} for ${post?.integration?.name}`,
      `We couldn't post to ${post.integration?.providerIdentifier} for ${post?.integration?.name} because you need to reconnect it. Please enable it and try again.`,
      true,
      false,
      'info'
    );
    return;
  }

  // if it's disabled, inform the user
  if (post.integration?.disabled) {
    await inAppNotification(
      post.organizationId,
      `We couldn't post to ${post.integration?.providerIdentifier} for ${post?.integration?.name}`,
      `We couldn't post to ${post.integration?.providerIdentifier} for ${post?.integration?.name} because it's disabled. Please enable it and try again.`,
      true,
      false,
      'info'
    );
    return;
  }

  // Mark all posts as PENDING_PUBLISH for CoWork to pick up
  const postsList = postsListBefore;
  for (const p of postsList) {
    await changeState(p.id, 'PENDING_PUBLISH');
  }

  // Notify CoWork via Discord webhook
  await notifyCowork(
    post.organizationId,
    postId,
    post.integration?.providerIdentifier || 'unknown',
    postsList.length
  );

  // Send in-app notification
  await inAppNotification(
    post.organizationId,
    `Post ready for CoWork publishing on ${capitalize(
      post.integration?.providerIdentifier || 'unknown'
    )}`,
    `${postsList.length} post(s) queued for CoWork on ${capitalize(
      post.integration?.providerIdentifier || 'unknown'
    )}. CoWork will handle publishing via Chrome.`,
    true,
    true
  );
}
