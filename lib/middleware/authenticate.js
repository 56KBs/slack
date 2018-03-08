/**
 * Ensure that the current Slack user is associated with a GitHub user.
 */
module.exports = async function authenticate(req, res, next) {
  const { SlackUser } = res.locals.robot.models;
  const slackId = req.body.user_id;
  const teamId = req.body.team_id;

  const slackUser = await SlackUser.lookup(teamId, slackId);

  if (slackUser) {
    req.log.debug({ slackId }, 'Authenticated user');

    // Store current user in res.locals so it can be used later in the request
    Object.assign(res.locals, {
      slackUser,
      slackWorkspace: slackUser.SlackWorkspace,
      gitHubUser: slackUser.GitHubUser,
    });

    next();
  } else {
    req.log.debug({ slackId }, 'User not found');

    // Modify request URL and pass on to the next matching route. In a normal
    // web application, this would simply be a redirect.
    req.url = '/signin';
    next('route');
  }
};
