const { Octokit } = require("@octokit/rest")
const simpleGit = require("simple-git")
const fs = require("fs").promises
const path = require("path")
const octokit = require("../config/github")

const githubService = {
  /**
   * Parse GitHub URL to extract owner and repo name
   */
  parseGitHubUrl(url) {
    try {
      // Handle various GitHub URL formats
      // https://github.com/owner/repo
      // https://github.com/owner/repo.git
      // git@github.com:owner/repo.git

      let cleanUrl = url.trim()

      // Remove .git suffix if present
      if (cleanUrl.endsWith(".git")) {
        cleanUrl = cleanUrl.slice(0, -4)
      }

      // Handle SSH format
      if (cleanUrl.startsWith("git@github.com:")) {
        cleanUrl = cleanUrl.replace("git@github.com:", "")
        const [owner, repo] = cleanUrl.split("/")
        return { owner, repo }
      }

      // Handle HTTPS format
      const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
      if (match) {
        return {
          owner: match[1],
          repo: match[2],
        }
      }

      throw new Error("Invalid GitHub URL format")
    } catch (error) {
      throw new Error(`Failed to parse GitHub URL: ${error.message}`)
    }
  },

  /**
   * Check if repository is accessible and determine if public or private
   */
  async checkRepoAccess(repoUrl) {
    try {
      const { owner, repo } = this.parseGitHubUrl(repoUrl)

      console.log(`Checking access for ${owner}/${repo}`)

      try {
        const response = await octokit.repos.get({
          owner,
          repo,
        })

        return {
          accessible: true,
          isPrivate: response.data.private,
          visibility: response.data.visibility,
          defaultBranch: response.data.default_branch,
          owner,
          repo,
        }
      } catch (error) {
        if (error.status === 404) {
          // Could be private without access, or doesn't exist
          console.log(`Repository not accessible: ${owner}/${repo}`)
          return {
            accessible: false,
            isPrivate: true,
            error: "REPO_NOT_ACCESSIBLE",
            message: "Repository not found or not accessible",
            owner,
            repo,
          }
        }

        if (error.status === 403) {
          console.log(`Rate limit or forbidden: ${owner}/${repo}`)
          return {
            accessible: false,
            isPrivate: true,
            error: "RATE_LIMIT_OR_FORBIDDEN",
            message: "API rate limit exceeded or access forbidden",
            owner,
            repo,
          }
        }

        throw error
      }
    } catch (error) {
      console.error("Error checking repo access:", error)
      throw error
    }
  },

  /**
   * Clone repository to temporary location
   */
  async cloneRepository(repoUrl, submissionId) {
    const clonePath = path.join("/tmp", "repos", submissionId)

    try {
      console.log(`Cloning repository to ${clonePath}`)

      // Ensure directory doesn't exist
      await this.deleteRepository(clonePath)

      // Create parent directory
      await fs.mkdir(path.dirname(clonePath), { recursive: true })

      // Clone with token authentication for private repos
      const authUrl = this.getAuthenticatedUrl(repoUrl)

      const git = simpleGit()
      await git.clone(authUrl, clonePath, ["--depth", "1"])

      console.log(`Repository cloned successfully to ${clonePath}`)

      return clonePath
    } catch (error) {
      console.error("Error cloning repository:", error)
      // Clean up on failure
      await this.deleteRepository(clonePath)
      throw new Error(`Failed to clone repository: ${error.message}`)
    }
  },

  /**
   * Get authenticated URL for cloning
   */
  getAuthenticatedUrl(repoUrl) {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      return repoUrl
    }

    const { owner, repo } = this.parseGitHubUrl(repoUrl)
    return `https://${token}@github.com/${owner}/${repo}.git`
  },

  /**
   * Get commit history from cloned repository
   */
  async getCommitHistory(repoPath) {
    try {
      const git = simpleGit(repoPath)

      console.log(`Analyzing commit history in ${repoPath}`)

      // Get all commits
      const log = await git.log()

      // Get commits with author info
      const commits = log.all.map((commit) => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        email: commit.author_email,
        date: commit.date,
      }))

      // Calculate statistics
      const dates = commits.map((c) => new Date(c.date))
      const oldestDate = new Date(Math.min(...dates))
      const newestDate = new Date(Math.max(...dates))
      const daysDiff = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24))

      // Count unique days with commits
      const uniqueDays = new Set(commits.map((c) => new Date(c.date).toISOString().split("T")[0])).size

      // Analyze commit messages
      const conventionalCommits = commits.filter((c) =>
        /^(feat|fix|docs|style|refactor|test|chore):/i.test(c.message),
      ).length

      return {
        totalCommits: commits.length,
        commits: commits, // Full commit data (will be sanitized later)
        timeline: {
          start: oldestDate,
          end: newestDate,
          days: daysDiff || 1,
          activeDays: uniqueDays,
        },
        commitQuality: {
          averageMessageLength: commits.reduce((sum, c) => sum + c.message.length, 0) / commits.length,
          conventionalCommits: conventionalCommits,
          conventionalPercentage: (conventionalCommits / commits.length) * 100,
        },
        commitsPerDay: commits.length / (daysDiff || 1),
      }
    } catch (error) {
      console.error("Error analyzing commit history:", error)
      throw new Error(`Failed to analyze commits: ${error.message}`)
    }
  },

  /**
   * Get branch information
   */
  async getBranchInfo(repoPath) {
    try {
      const git = simpleGit(repoPath)

      console.log(`Analyzing branches in ${repoPath}`)

      // Get all branches
      const branches = await git.branch(["-a"])

      // Get current branch
      const currentBranch = branches.current

      // Count feature branches (excluding main/master and remotes)
      const featureBranches = branches.all.filter(
        (b) => !b.includes("HEAD") && !b.includes("main") && !b.includes("master") && !b.startsWith("remotes/"),
      )

      return {
        currentBranch,
        totalBranches: branches.all.length,
        featureBranches: featureBranches,
        branchNames: branches.all,
      }
    } catch (error) {
      console.error("Error analyzing branches:", error)
      throw new Error(`Failed to analyze branches: ${error.message}`)
    }
  },

  /**
   * Get list of files in repository
   */
  async getFileList(repoPath) {
    try {
      const files = []

      async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          const relativePath = path.relative(repoPath, fullPath)

          // Skip .git directory and node_modules
          if (entry.name === ".git" || entry.name === "node_modules") {
            continue
          }

          if (entry.isDirectory()) {
            await walk(fullPath)
          } else {
            files.push(relativePath)
          }
        }
      }

      await walk(repoPath)
      return files
    } catch (error) {
      console.error("Error listing files:", error)
      throw new Error(`Failed to list files: ${error.message}`)
    }
  },

  /**
   * Read file contents
   */
  async readFile(repoPath, filePath) {
    try {
      const fullPath = path.join(repoPath, filePath)
      const content = await fs.readFile(fullPath, "utf-8")
      return content
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error)
      return null
    }
  },

  /**
   * Delete cloned repository
   */
  async deleteRepository(repoPath) {
    try {
      await fs.rm(repoPath, { recursive: true, force: true })
      console.log(`Deleted repository at ${repoPath}`)
    } catch (error) {
      // Ignore errors if directory doesn't exist
      if (error.code !== "ENOENT") {
        console.error("Error deleting repository:", error)
      }
    }
  },

  /**
   * Complete analysis of repository
   */
  async analyzeRepository(repoUrl, submissionId) {
    let repoPath = null

    try {
      // Clone repository
      repoPath = await this.cloneRepository(repoUrl, submissionId)

      // Gather all analysis data
      const [commitHistory, branchInfo, fileList] = await Promise.all([
        this.getCommitHistory(repoPath),
        this.getBranchInfo(repoPath),
        this.getFileList(repoPath),
      ])

      return {
        repoPath,
        commits: commitHistory,
        branches: branchInfo,
        files: fileList,
      }
    } catch (error) {
      // Clean up on error
      if (repoPath) {
        await this.deleteRepository(repoPath)
      }
      throw error
    }
  },
}

module.exports = githubService
