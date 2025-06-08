import { EXCLUDED_CATEGORY_IDS } from './config.js'

let sessionToken = ''

/**
 * Fetches a new session token from OpenTDB and stores it.
 */
export async function initSessionToken() {
  const res = await fetch('https://opentdb.com/api_token.php?command=request')
  const data = await res.json()
  if (data.response_code === 0) {
    sessionToken = data.token
  } else {
    throw new Error('Failed to get session token.')
  }
}

/**
 * Resets the current session token if all questions have been used.
 */
async function resetSessionToken() {
  const res = await fetch(`https://opentdb.com/api_token.php?command=reset&token=${sessionToken}`)
  const data = await res.json()
  if (data.response_code !== 0) {
    throw new Error('Failed to reset session token.')
  }
}

/**
 * Fetches up to 50 boolean questions using the session token.
 */
export async function fetchTriviaQuestions(amount = 50, attempts = 4) {
  const url = `https://opentdb.com/api.php?amount=${amount}&type=boolean&encode=base64&token=${sessionToken}`
  let retries = 0

  while (retries < attempts) {
    const res = await fetch(url)
    const data = await res.json()

    switch (data.response_code) {
      case 0: {
        const decoded = data.results.map(decodeBase64Question)
        return decoded
      }

      case 1:
        throw new Error('Not enough questions available for the given parameters.')

      case 4:
        await resetSessionToken()
        return fetchTriviaQuestions(amount)

      case 5:
        retries++
        await new Promise(res => setTimeout(res, 2000))
        continue

      default:
        throw new Error(`Unexpected API response code: ${data.response_code}`)
    }
  }

  throw new Error('Failed to fetch questions after multiple attempts due to an invalid session token.')
}

/**
 * Decodes a base64-encoded question object from OpenTDB.
 */
function decodeBase64Question(q) {
  return {
    ...q,
    category: atob(q.category),
    question: atob(q.question),
    correct_answer: atob(q.correct_answer),
    difficulty: atob(q.difficulty),
    type: atob(q.type)
  }
}

/**
 * Fetches category list and returns a filtered map by excluding categories in config.
 */
export async function fetchValidCategories() {
  const res = await fetch('https://opentdb.com/api_category.php')
  const data = await res.json()
  const valid = data.trivia_categories.filter(c => !EXCLUDED_CATEGORY_IDS.includes(c.id))
  return valid
}