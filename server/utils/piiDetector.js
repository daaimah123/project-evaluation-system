/**
 * PII Detection and Replacement Utilities
 * Detects and replaces Personally Identifiable Information in code
 */

const piiDetector = {
  /**
   * Email pattern - matches most email formats
   */
  emailPattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  /**
   * Phone number patterns - various formats
   */
  phonePatterns: [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // 123-456-7890 or 1234567890
    /\b$$\d{3}$$\s*\d{3}[-.]?\d{4}\b/g, // (123) 456-7890
    /\b\+\d{1,3}\s*\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // +1 123-456-7890
  ],

  /**
   * SSN pattern
   */
  ssnPattern: /\b\d{3}-\d{2}-\d{4}\b/g,

  /**
   * Name in comments pattern - looks for "Author:", "Created by", etc.
   */
  nameInCommentPatterns: [
    /(@author|Author:|Created by|Written by)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
    /\/\/\s*([A-Z][a-z]+\s+[A-Z][a-z]+)\s*-/g,
  ],

  /**
   * Detect all PII in text
   */
  detectPII(text) {
    const detected = {
      emails: [],
      phones: [],
      ssns: [],
      names: [],
    }

    // Find emails
    const emailMatches = text.match(this.emailPattern)
    if (emailMatches) {
      detected.emails = [...new Set(emailMatches)]
    }

    // Find phone numbers
    this.phonePatterns.forEach((pattern) => {
      const matches = text.match(pattern)
      if (matches) {
        detected.phones.push(...matches)
      }
    })
    detected.phones = [...new Set(detected.phones)]

    // Find SSNs
    const ssnMatches = text.match(this.ssnPattern)
    if (ssnMatches) {
      detected.ssns = [...new Set(ssnMatches)]
    }

    // Find names in comments
    this.nameInCommentPatterns.forEach((pattern) => {
      const matches = [...text.matchAll(pattern)]
      matches.forEach((match) => {
        if (match[2]) {
          detected.names.push(match[2])
        } else if (match[1] && /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(match[1])) {
          detected.names.push(match[1])
        }
      })
    })
    detected.names = [...new Set(detected.names)]

    return detected
  },

  /**
   * Replace emails with placeholder
   */
  sanitizeEmails(text) {
    // Keep example.com emails as they're typically placeholders
    return text.replace(this.emailPattern, (match) => {
      if (match.includes("example.com") || match.includes("test.com")) {
        return match
      }
      return "[EMAIL]"
    })
  },

  /**
   * Replace phone numbers with placeholder
   */
  sanitizePhones(text) {
    let sanitized = text
    this.phonePatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "[PHONE]")
    })
    return sanitized
  },

  /**
   * Replace SSNs with placeholder
   */
  sanitizeSSNs(text) {
    return text.replace(this.ssnPattern, "[SSN]")
  },

  /**
   * Replace names in comments with placeholder
   */
  sanitizeNames(text) {
    let sanitized = text

    this.nameInCommentPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, (match, prefix, name) => {
        if (name) {
          return `${prefix} [DEVELOPER_NAME]`
        }
        return match.replace(/[A-Z][a-z]+\s+[A-Z][a-z]+/, "[DEVELOPER_NAME]")
      })
    })

    return sanitized
  },

  /**
   * Sanitize all PII in text
   */
  sanitizeAll(text) {
    let sanitized = text
    sanitized = this.sanitizeEmails(sanitized)
    sanitized = this.sanitizePhones(sanitized)
    sanitized = this.sanitizeSSNs(sanitized)
    sanitized = this.sanitizeNames(sanitized)
    return sanitized
  },
}

module.exports = piiDetector
