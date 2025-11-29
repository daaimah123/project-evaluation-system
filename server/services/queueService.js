/**
 * Simple in-memory queue for evaluation jobs
 * Post-MVP: Replace with Redis-based queue (Bull/BullMQ)
 */

const queue = []
const processing = new Set()

const queueService = {
  /**
   * Add evaluation job to queue
   */
  addEvaluation(submissionId) {
    const job = {
      id: submissionId,
      submissionId,
      status: "pending",
      addedAt: new Date(),
      attempts: 0,
    }

    queue.push(job)
    console.log(`[v0] Added submission ${submissionId} to evaluation queue. Queue size: ${queue.length}`)

    return job
  },

  /**
   * Get next pending job from queue
   */
  getNextJob() {
    // Find first job that's not being processed
    const job = queue.find((j) => j.status === "pending" && !processing.has(j.submissionId))

    if (job) {
      job.status = "processing"
      job.startedAt = new Date()
      processing.add(job.submissionId)
      console.log(`[v0] Processing job: ${job.submissionId}`)
    }

    return job
  },

  /**
   * Mark job as complete
   */
  completeJob(submissionId, success = true) {
    const index = queue.findIndex((j) => j.submissionId === submissionId)

    if (index !== -1) {
      queue.splice(index, 1)
      processing.delete(submissionId)

      console.log(`[v0] Job ${submissionId} completed (${success ? "success" : "failed"}). Queue size: ${queue.length}`)
    }
  },

  /**
   * Mark job as failed (retry later)
   */
  failJob(submissionId, error) {
    const job = queue.find((j) => j.submissionId === submissionId)

    if (job) {
      job.attempts++
      job.lastError = error.message
      job.status = "pending"
      processing.delete(submissionId)

      // Remove job if too many attempts
      if (job.attempts >= 3) {
        console.error(`[v0] Job ${submissionId} failed after ${job.attempts} attempts. Removing from queue.`)
        const index = queue.findIndex((j) => j.submissionId === submissionId)
        if (index !== -1) {
          queue.splice(index, 1)
        }
      } else {
        console.log(`[v0] Job ${submissionId} failed. Attempt ${job.attempts}/3. Will retry.`)
      }
    }
  },

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      pending: queue.filter((j) => j.status === "pending").length,
      processing: processing.size,
      total: queue.length,
    }
  },

  /**
   * Check if submission is in queue
   */
  isInQueue(submissionId) {
    return queue.some((j) => j.submissionId === submissionId)
  },
}

module.exports = queueService
