/**
 * Profanity filter utility
 * Filters out profanity and inappropriate language from user messages
 */

// Common profanity words and phrases (basic list - can be expanded)
const PROFANITY_WORDS = [
  // Explicit profanity
  'fuck', 'fucking', 'fucked', 'fucker',
  'shit', 'shitting', 'shitted',
  'damn', 'damned', 'dammit',
  'hell', 'hells',
  'ass', 'asses', 'asshole', 'assholes',
  'bitch', 'bitches', 'bitching',
  'bastard', 'bastards',
  'crap', 'crappy',
  'piss', 'pissing', 'pissed',
  'dick', 'dicks', 'dickhead',
  'cock', 'cocks',
  'pussy', 'pussies',
  'slut', 'sluts',
  'whore', 'whores',
  // Hate speech
  'nigger', 'nigga', 'niggas',
  'retard', 'retarded', 'retards',
  'gay', 'gays', // Only when used pejoratively - context dependent
  // Other inappropriate terms
  'kill', 'killing', 'killed', // Only in threatening context
  'die', 'dying', 'death', // Only in threatening context
  'bait',
]

// Words that should be allowed in educational context
const ALLOWED_WORDS = [
  'class', 'classroom', 'classic', 'classify', 'classification',
  'assess', 'assessment', 'assistant', 'associate', 'association',
  'pass', 'passing', 'password', 'passage', 'passive',
  'dam', 'damage', 'damages', 'damaged',
]

/**
 * Checks if a word contains profanity
 */
function containsProfanity(word: string): boolean {
  const lowerWord = word.toLowerCase().replace(/[^a-z]/g, '')
  
  // Check if it's an allowed word
  if (ALLOWED_WORDS.some(allowed => lowerWord.includes(allowed.toLowerCase()))) {
    return false
  }
  
  // Check against profanity list (exact match only to avoid false positives like "hello" containing "hell")
  return PROFANITY_WORDS.some(profanity => lowerWord === profanity)
}

/**
 * Filters profanity from a message
 * @param message - The message to filter
 * @returns The filtered message with profanity replaced with asterisks
 */
export function filterProfanity(message: string): string {
  if (!message || typeof message !== 'string') {
    return message
  }

  // Split message into words while preserving punctuation
  const words = message.split(/(\s+|[.,!?;:])/)
  
  const filteredWords = words.map(word => {
    // Skip whitespace and punctuation
    if (/^\s*$/.test(word) || /^[.,!?;:]+$/.test(word)) {
      return word
    }
    
    // Check if word contains profanity
    if (containsProfanity(word)) {
      // Replace with asterisks, preserving first and last character if word is long enough
      const cleaned = word.replace(/[a-zA-Z]/g, '*')
      return cleaned
    }
    
    return word
  })
  
  return filteredWords.join('')
}

/**
 * Checks if a message contains profanity without filtering
 * @param message - The message to check
 * @returns true if message contains profanity
 */
export function hasProfanity(message: string): boolean {
  if (!message || typeof message !== 'string') {
    return false
  }

  const words = message.split(/\s+/)
  return words.some(word => containsProfanity(word))
}

