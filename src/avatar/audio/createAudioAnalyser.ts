import { AUDIO } from "../core/constants"

export interface AudioAnalyserOptions {
  fftSize?: number
  smoothingTimeConstant?: number
}

export function createAudioAnalyser(
  audioContext: AudioContext,
  sourceNode: AudioNode,
  options: AudioAnalyserOptions = {},
): AnalyserNode {
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = options.fftSize ?? AUDIO.fftSize
  analyser.smoothingTimeConstant = options.smoothingTimeConstant ?? AUDIO.smoothingTimeConstant
  sourceNode.connect(analyser)
  return analyser
}

export function disposeAudioAnalyser(analyser: AnalyserNode, sourceNode?: AudioNode): void {
  try {
    sourceNode?.disconnect(analyser)
  } catch {
    // The source may already be disconnected.
  }
  try {
    analyser.disconnect()
  } catch {
    // The analyser may already be disconnected.
  }
}
