const piiDetector = require("../utils/piiDetector")
const path = require("path")

const sanitizationService = {
  /**
   * Files to exclude from AI evaluation (contain sample/seed data)
   */
  excludePatterns: [
    /seeds?\//i,
    /fixtures?\//i,
    /sample[-_]?data/i,
    /__mocks__\//i,
    /test[-_]?data/i,
    /\.sql$/i, // Exclude SQL files by default as they may contain seed data
  ],

  /**
   * Check if file should be excluded from AI evaluation
   */
  shouldExcludeFile(filePath) {
    return this.excludePatterns.some((pattern) => pattern.test(filePath))
  },

  /**
   * Sanitize code content by removing PII
   */
  sanitizeCode(code, filePath) {
    if (!code) return null

    // Skip binary files or very large files
    if (code.length > 50000) {
      console.log(`[v0] Skipping large file: ${filePath}`)
      return null
    }

    // Sanitize all PII
    const sanitized = piiDetector.sanitizeAll(code)

    return sanitized
  },

  /**
   * Sanitize git commit history
   */
  sanitizeCommitHistory(commits) {
    if (!commits || !Array.isArray(commits)) {
      return []
    }

    // Remove author information but keep commit messages and dates
    return commits.map((commit) => ({
      hash: commit.hash.substring(0, 7), // Short hash
      message: commit.message,
      date: commit.date,
      // Removed: author, email
    }))
  },

  /**
   * Sanitize git statistics
   */
  sanitizeGitStats(gitData) {
    const { commits, branches } = gitData

    return {
      commitActivity: {
        total: commits.totalCommits,
        timeline: commits.timeline,
        activeDays: commits.timeline.activeDays,
        commitsPerDay: commits.commitsPerDay,
        // Remove individual commit details with author info
        commitMessages: this.sanitizeCommitHistory(commits.commits),
      },
      commitQuality: commits.commitQuality,
      branches: {
        total: branches.totalBranches,
        featureBranches: branches.featureBranches.length,
        branchNames: branches.branchNames.filter((b) => !b.includes("HEAD") && !b.startsWith("remotes/")),
      },
    }
  },

  /**
   * Sanitize repository data for AI evaluation
   */
  async sanitizeRepository(repoData, fileContents) {
    const sanitizedFiles = []
    const excludedFiles = []
    const piiStats = {
      emails: 0,
      phones: 0,
      names: 0,
      filesExcluded: 0,
    }

    // Process each file
    for (const [filePath, content] of Object.entries(fileContents)) {
      // Check if file should be excluded
      if (this.shouldExcludeFile(filePath)) {
        excludedFiles.push(filePath)
        piiStats.filesExcluded++
        continue
      }

      // Detect PII before sanitization
      const detected = piiDetector.detectPII(content)
      piiStats.emails += detected.emails.length
      piiStats.phones += detected.phones.length
      piiStats.names += detected.names.length

      // Sanitize content
      const sanitized = this.sanitizeCode(content, filePath)

      if (sanitized) {
        sanitizedFiles.push({
          path: filePath,
          content: sanitized,
        })
      }
    }

    // Sanitize git data
    const sanitizedGitStats = this.sanitizeGitStats({
      commits: repoData.commits,
      branches: repoData.branches,
    })

    return {
      files: sanitizedFiles,
      excludedFiles,
      gitStats: sanitizedGitStats,
      piiDetected: piiStats,
    }
  },

  /**
   * Create sanitization report for staff
   */
  createSanitizationReport(piiStats, excludedFiles) {
    return {
      piiRemoved: {
        emails: piiStats.emails,
        phones: piiStats.phones,
        names: piiStats.names,
      },
      filesExcluded: {
        count: piiStats.filesExcluded,
        files: excludedFiles,
      },
      timestamp: new Date().toISOString(),
    }
  },
}

module.exports = sanitizationService
