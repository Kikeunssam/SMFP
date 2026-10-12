interface PlaybackNavigator {
  audioSession?: { type: string };
}

/** Music playback must not inherit iOS's ambient/ringer-mute behavior. */
export function configurePlaybackSession(platform: PlaybackNavigator) {
  try {
    if (platform.audioSession && platform.audioSession.type !== 'playback') {
      platform.audioSession.type = 'playback';
    }
  } catch (error) {
    // Unsupported or restricted webviews must still be able to start Web Audio.
    console.warn('SMFP: playback audio session unavailable.', error);
  }
}
