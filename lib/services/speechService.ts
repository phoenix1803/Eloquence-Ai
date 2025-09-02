interface VoiceAnalysis {
    confidence: number
    clarity: number
    pace: number
    volume: number
    fillerWords: number
    hesitations: number
}

export class SpeechService {
    private recognition: SpeechRecognition | null = null
    private synthesis: SpeechSynthesis
    private audioContext: AudioContext | null = null
    private analyser: AnalyserNode | null = null
    private microphone: MediaStreamAudioSourceNode | null = null
    private isListening = false
    private onTranscriptCallback?: (transcript: string, isFinal: boolean) => void
    private onVoiceAnalysisCallback?: (analysis: VoiceAnalysis) => void

    constructor() {
        this.synthesis = window.speechSynthesis
        this.initializeSpeechRecognition()
    }

    private initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            this.recognition = new SpeechRecognition()

            this.recognition.continuous = true
            this.recognition.interimResults = true
            this.recognition.lang = 'en-US'
            this.recognition.maxAlternatives = 1

            this.recognition.onresult = (event) => {
                let interimTranscript = ''
                let finalTranscript = ''

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript
                    } else {
                        interimTranscript += transcript
                    }
                }

                if (finalTranscript && this.onTranscriptCallback) {
                    this.onTranscriptCallback(finalTranscript, true)
                    this.analyzeVoicePattern(finalTranscript)
                } else if (interimTranscript && this.onTranscriptCallback) {
                    this.onTranscriptCallback(interimTranscript, false)
                }
            }

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error)
                if (event.error === 'no-speech') {
                    this.restartRecognition()
                }
            }

            this.recognition.onend = () => {
                if (this.isListening) {
                    this.restartRecognition()
                }
            }
        }
    }

    private restartRecognition() {
        if (this.recognition && this.isListening) {
            setTimeout(() => {
                try {
                    this.recognition?.start()
                } catch (error) {
                    console.error('Error restarting recognition:', error)
                }
            }, 100)
        }
    }

    async startListening(
        onTranscript: (transcript: string, isFinal: boolean) => void,
        onVoiceAnalysis: (analysis: VoiceAnalysis) => void
    ) {
        this.onTranscriptCallback = onTranscript
        this.onVoiceAnalysisCallback = onVoiceAnalysis

        try {
            // Start speech recognition
            if (this.recognition) {
                this.isListening = true
                this.recognition.start()
            }

            // Start audio analysis
            await this.startAudioAnalysis()
        } catch (error) {
            console.error('Error starting speech recognition:', error)
        }
    }

    private async startAudioAnalysis() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            this.audioContext = new AudioContext()
            this.analyser = this.audioContext.createAnalyser()
            this.microphone = this.audioContext.createMediaStreamSource(stream)

            this.analyser.fftSize = 256
            this.microphone.connect(this.analyser)

            this.monitorAudioLevels()
        } catch (error) {
            console.error('Error accessing microphone:', error)
        }
    }

    private monitorAudioLevels() {
        if (!this.analyser) return

        const bufferLength = this.analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const analyze = () => {
            if (!this.isListening) return

            this.analyser!.getByteFrequencyData(dataArray)

            // Calculate volume level
            const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength

            // Calculate frequency distribution for clarity analysis
            const lowFreq = dataArray.slice(0, bufferLength / 4).reduce((sum, val) => sum + val, 0)
            const midFreq = dataArray.slice(bufferLength / 4, 3 * bufferLength / 4).reduce((sum, val) => sum + val, 0)
            const highFreq = dataArray.slice(3 * bufferLength / 4).reduce((sum, val) => sum + val, 0)

            // Store audio data for analysis
            this.storeAudioData({ volume, lowFreq, midFreq, highFreq })

            requestAnimationFrame(analyze)
        }

        analyze()
    }

    private audioDataBuffer: Array<{ volume: number, lowFreq: number, midFreq: number, highFreq: number }> = []
    private speechStartTime: number = 0
    private wordCount: number = 0

    private storeAudioData(data: { volume: number, lowFreq: number, midFreq: number, highFreq: number }) {
        this.audioDataBuffer.push(data)

        // Keep only last 5 seconds of data
        if (this.audioDataBuffer.length > 250) { // ~50fps * 5 seconds
            this.audioDataBuffer.shift()
        }
    }

    private analyzeVoicePattern(transcript: string) {
        if (!this.onVoiceAnalysisCallback) return

        const words = transcript.trim().split(/\s+/)
        this.wordCount += words.length

        // Analyze filler words
        const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually']
        const fillerCount = words.filter(word =>
            fillerWords.includes(word.toLowerCase().replace(/[.,!?]/g, ''))
        ).length

        // Analyze hesitations (repeated words, long pauses)
        const hesitations = this.detectHesitations(transcript)

        // Calculate speaking pace (words per minute)
        const timeElapsed = (Date.now() - this.speechStartTime) / 1000 / 60 // minutes
        const pace = timeElapsed > 0 ? (this.wordCount / timeElapsed) : 0

        // Analyze audio data for confidence and clarity
        const audioAnalysis = this.analyzeAudioData()

        const analysis: VoiceAnalysis = {
            confidence: this.calculateConfidence(audioAnalysis, fillerCount, hesitations),
            clarity: this.calculateClarity(audioAnalysis),
            pace: Math.min(100, (pace / 150) * 100), // 150 WPM is optimal
            volume: audioAnalysis.averageVolume,
            fillerWords: fillerCount,
            hesitations: hesitations
        }

        this.onVoiceAnalysisCallback(analysis)
    }

    private detectHesitations(transcript: string): number {
        const words = transcript.toLowerCase().split(/\s+/)
        let hesitations = 0

        // Detect repeated words
        for (let i = 0; i < words.length - 1; i++) {
            if (words[i] === words[i + 1] && words[i].length > 2) {
                hesitations++
            }
        }

        // Detect incomplete words or stuttering
        const incompletePattern = /\b\w{1,2}-\b|\b\w+-\w+\b/g
        const matches = transcript.match(incompletePattern)
        hesitations += matches ? matches.length : 0

        return hesitations
    }

    private analyzeAudioData() {
        if (this.audioDataBuffer.length === 0) {
            return { averageVolume: 50, volumeVariation: 0, clarityScore: 50 }
        }

        const volumes = this.audioDataBuffer.map(d => d.volume)
        const averageVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length

        // Calculate volume variation (consistency)
        const volumeVariation = Math.sqrt(
            volumes.reduce((sum, vol) => sum + Math.pow(vol - averageVolume, 2), 0) / volumes.length
        )

        // Calculate clarity based on frequency distribution
        const clarityScore = this.audioDataBuffer.reduce((sum, data) => {
            const total = data.lowFreq + data.midFreq + data.highFreq
            const midFreqRatio = total > 0 ? data.midFreq / total : 0
            return sum + midFreqRatio * 100
        }, 0) / this.audioDataBuffer.length

        return {
            averageVolume: Math.min(100, (averageVolume / 128) * 100),
            volumeVariation,
            clarityScore: Math.min(100, clarityScore)
        }
    }

    private calculateConfidence(audioAnalysis: any, fillerCount: number, hesitations: number): number {
        let confidence = 100

        // Reduce confidence for filler words
        confidence -= fillerCount * 5

        // Reduce confidence for hesitations
        confidence -= hesitations * 8

        // Reduce confidence for volume inconsistency
        confidence -= audioAnalysis.volumeVariation * 2

        // Reduce confidence for very low volume (nervousness)
        if (audioAnalysis.averageVolume < 30) {
            confidence -= 20
        }

        return Math.max(0, Math.min(100, confidence))
    }

    private calculateClarity(audioAnalysis: any): number {
        return Math.min(100, audioAnalysis.clarityScore)
    }

    stopListening() {
        this.isListening = false

        if (this.recognition) {
            this.recognition.stop()
        }

        if (this.audioContext) {
            this.audioContext.close()
            this.audioContext = null
        }

        if (this.microphone) {
            this.microphone.disconnect()
            this.microphone = null
        }

        this.analyser = null
        this.audioDataBuffer = []
        this.wordCount = 0
    }

    async speak(text: string, options: { rate?: number, pitch?: number, volume?: number } = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('Speech synthesis not supported'))
                return
            }

            // Cancel any ongoing speech
            this.synthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)

            // Configure voice settings
            utterance.rate = options.rate || 0.9
            utterance.pitch = options.pitch || 1
            utterance.volume = options.volume || 0.8

            // Try to use a more natural voice
            const voices = this.synthesis.getVoices()
            const preferredVoice = voices.find(voice =>
                voice.name.includes('Google') ||
                voice.name.includes('Microsoft') ||
                voice.name.includes('Natural')
            ) || voices.find(voice => voice.lang.startsWith('en'))

            if (preferredVoice) {
                utterance.voice = preferredVoice
            }

            utterance.onend = () => resolve()
            utterance.onerror = (error) => reject(error)

            this.synthesis.speak(utterance)
        })
    }

    // Enhanced TTS with ElevenLabs-like quality (using Web Speech API optimizations)
    async speakWithEnhancedVoice(text: string): Promise<void> {
        // For better quality, we could integrate with services like:
        // - ElevenLabs API
        // - Azure Cognitive Services
        // - Google Cloud Text-to-Speech
        // For now, using optimized Web Speech API

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

        for (const sentence of sentences) {
            await this.speak(sentence.trim(), {
                rate: 0.85, // Slightly slower for clarity
                pitch: 1.1, // Slightly higher pitch for engagement
                volume: 0.9
            })

            // Small pause between sentences
            await new Promise(resolve => setTimeout(resolve, 200))
        }
    }

    startSpeechTimer() {
        this.speechStartTime = Date.now()
        this.wordCount = 0
    }
}

// Extend Window interface for TypeScript
declare global {
    interface Window {
        SpeechRecognition: any
        webkitSpeechRecognition: any
    }
}