import nock from "nock";
import request from "supertest";

const helper = require(".");
const fixtures = require("../fixtures");

const { probot } = helper;

describe("Integration: subscription list", () => {
  beforeEach(async () => {
    const { SlackWorkspace, Installation, Subscription } = helper.robot.models;

    const workspace = await SlackWorkspace.create({
      accessToken: "secret",
      slackId: 1,
    });

    const installation = await Installation.create({
      githubId: 1,
      ownerId: 1,
    });

    await Subscription.create({
      channelId: "C2147483705",
      githubId: 1,
      installationId: installation.id,
      slackWorkspaceId: workspace.id,
    });

    await Subscription.create({
      channelId: "C2147483705",
      githubId: 2,
      installationId: installation.id,
      slackWorkspaceId: workspace.id,
    });
  });

  test("works for /github subscribe list", async () => {
    nock("https://api.github.com").get("/repositories/1").reply(200, {
      full_name: "atom/atom",
      html_url: "https://github.com/atom/atom",
    });
    nock("https://api.github.com").get("/repositories/2").reply(200, {
      full_name: "kubernetes/kubernetes",
      html_url: "https://github.com/kubernetes/kubernetes",
    });
    const command = fixtures.slack.command({
      text: "subscribe list",
    });

    await request(probot.server).post("/slack/command").send(command)
     .expect(200)
     .expect((res) => {
       expect(res.body).toMatchSnapshot();
     });
  });

  test("works for /github subscribe", async () => {
    nock("https://api.github.com").get("/repositories/1").reply(200, {
      full_name: "atom/atom",
      html_url: "https://github.com/atom/atom",
    });
    nock("https://api.github.com").get("/repositories/2").reply(200, {
      full_name: "kubernetes/kubernetes",
      html_url: "https://github.com/kubernetes/kubernetes",
    });
    const command = fixtures.slack.command({
      text: "subscribe",
    });

    await request(probot.server).post("/slack/command").send(command)
     .expect(200)
     .expect((res) => {
       expect(res.body).toMatchSnapshot();
     });
  });
});
