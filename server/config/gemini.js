const { GoogleGenerativeAI } = require("@google/generative-ai")
require("dotenv").config()

if (!process.env.GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY not set. AI evaluations will not work.")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Using gemini-1.5-flash for free tier
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

module.exports = { genAI, model }
