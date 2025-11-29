const { Octokit } = require("@octokit/rest")
require("dotenv").config()

if (!process.env.GITHUB_TOKEN) {
  console.warn("Warning: GITHUB_TOKEN not set. GitHub API calls will be limited.")
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "project-evaluation-system v1.0.0",
  timeZone: "America/Los_Angeles",
})

module.exports = octokit
