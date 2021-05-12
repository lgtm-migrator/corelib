import { i18n } from '../i18n/i18n'

export const BrowserTTS = {}

BrowserTTS.name = 'ttsBrowser'

// /////////////////////////////////////////////////////////////////////////////
//
// INTERNAL
//
// /////////////////////////////////////////////////////////////////////////////

let loadVoiceCount = 0
let voicesLoaded = false

const internal = {
  voices: undefined,
  speechSynth: undefined,
  cache: new Map()
}

/**
 * Returns the first found voice for a given language code.
 */

function getVoices (locale) {
  if (!internal.speechSynth) {
    throw new Error('Browser does not support speech synthesis')
  }

  // skip until voices loader is complete
  if (!voicesLoaded) {
    return []
  }

  if (!internal.voices || internal.voices.length === 0) {
    throw new Error('No voices installed for speech synthesis')
  }

  if (!internal.cache.has(locale)) {
    const lowerCaseLocale = locale.toLocaleLowerCase()
    console.debug('[BrowserTTS]: find voice for locale', locale)
    const voicesForLocale = internal.voices.filter(voice => voice.lang.toLocaleLowerCase().includes(lowerCaseLocale))

    if (!voicesForLocale.length === 0) {
      throw new Error(`No voices found for locale [${locale}]`)
    }


    console.debug('[BrowserTTS]: found voices for locale', locale, voicesForLocale)
    internal.cache.set(locale, voicesForLocale)
  }

  return internal.cache.get(locale)
}

/**
 * Speak a certain text
 * @param locale the locale this voice requires
 * @param text the text to speak
 * @param onEnd callback if tts is finished
 * @param onError callback if tts has an internal error
 */

function playByText (locale, text, { volume, onEnd, onError }) {
  const voices = getVoices(locale)

  if (!voices?.length) {
    throw new Error('No voices found to create utterance')
  }

  // TODO load preference here, e.g. male / female etc.
  // TODO but for now we just use the first occurrence
  const utterance = new global.SpeechSynthesisUtterance(text)
  utterance.voice = voices[0]
  //utterance.pitch = 1
  //utterance.rate = 1
  //utterance.voiceURI = 'native'
  //utterance.rate = 1
  //utterance.pitch = 0.8
  //utterance.lang = voices[0].lang || locale

  if (onEnd) {
    utterance.onend = onEnd
  }

  if (onError) {
    utterance.onerror = function (event) {
      onError(event.error || event)
    }
  }

  internal.speechSynth.cancel() // cancel current speak, if any is running
  internal.speechSynth.speak(utterance)
}

/**
 *
 * @param locale
 * @param id
 * @param onEnd
 * @param onError
 */
function playById (locale, id, { volume, onEnd, onError }) {
  const translated = i18n.get(id)
  if (!translated || translated === `${locale}.${id}`) {
    throw new Error(`Unknown TTS by id [${id}]`)
  }

  return playByText(locale, translated, { volume, onEnd, onError })
}

// /////////////////////////////////////////////////////////////////////////////
//
// PUBLIC
//
// /////////////////////////////////////////////////////////////////////////////

BrowserTTS.play = function play ({ id, text, volume, onEnd, onError }) {
  let locale = i18n.getLocale()

  if (text) {
    return playByText(locale, text, { volume, onEnd, onError })
  } else {
    return playById(locale, id, { volume, onEnd, onError })
  }
}

BrowserTTS.stop = function stop () {
  internal.speechSynth.cancel()
}


const MAX_LOAD_VOICES = 5

/**
 * retries until there have been voices loaded. No stopper flag included in this example.
 * Note that this function assumes, that there are voices installed on the host system.
 */
BrowserTTS.load = function loadVoicesWhenAvailable ({ onComplete = () => {}, onError = err => console.error(err) } = {}) {
  internal.speechSynth = window.speechSynthesis
  const loadedVoices = internal.speechSynth.getVoices()

  if (loadedVoices.length !== 0) {
    internal.voices = loadedVoices
    console.debug('[BrowserTTS]: voices loaded', internal.voices)
    voicesLoaded = true
    return onComplete()
  }

  if (++loadVoiceCount > MAX_LOAD_VOICES) {
    return onError(new Error(`Failed to load speech synthesis voices, after ${loadVoiceCount} retries.`))
  }

  return setTimeout(() => BrowserTTS.load({ onComplete, onError }), 100)
}
