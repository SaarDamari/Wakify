/* eslint-env jest */
jest.mock('@notifee/react-native', () =>
  require('@notifee/react-native/jest-mock'),
);

jest.mock('react-native-app-auth', () => ({
  authorize: jest.fn(() => Promise.resolve({})),
  refresh: jest.fn(() => Promise.resolve({})),
}));

jest.mock('react-native-spotify-remote', () => ({
  remote: {
    isConnectedAsync: jest.fn(() => Promise.resolve(false)),
    connect: jest.fn(() => Promise.resolve()),
    setShuffling: jest.fn(() => Promise.resolve()),
    playUri: jest.fn(() => Promise.resolve()),
    getPlayerState: jest.fn(() =>
      Promise.resolve({
        track: { name: '', artist: { name: '' }, album: { name: '' } },
      }),
    ),
    pause: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(() => Promise.resolve()),
  },
  auth: {
    authorize: jest.fn(() =>
      Promise.resolve({
        accessToken: 'tok',
        refreshToken: 'ref',
        expirationDate: new Date(Date.now() + 3600_000).toISOString(),
        expired: false,
      }),
    ),
    getSession: jest.fn(() => Promise.resolve(undefined)),
    endSession: jest.fn(() => Promise.resolve()),
  },
  ApiScope: {
    AppRemoteControlScope: 'app-remote-control',
    StreamingScope: 'streaming',
    UserModifyPlaybackStateScope: 'user-modify-playback-state',
    UserReadPlaybackStateScope: 'user-read-playback-state',
    UserReadPrivateScope: 'user-read-private',
  },
}));

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve()),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-volume-manager', () => ({
  VolumeManager: {
    getVolume: jest.fn(() => Promise.resolve({ volume: 0.5 })),
    setVolume: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('react-native-sound', () => {
  class SoundMock {
    constructor(_file, _basePath, onLoad) {
      if (onLoad) {
        onLoad(null);
      }
    }
    setNumberOfLoops() {
      return this;
    }
    play() {}
    stop() {}
    release() {}
  }
  SoundMock.MAIN_BUNDLE = 'MAIN_BUNDLE';
  SoundMock.setCategory = jest.fn();
  return SoundMock;
});

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(key => Promise.resolve(store[key] ?? null)),
      setItem: jest.fn((key, value) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn(key => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
    },
  };
});
