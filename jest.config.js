const expoPreset = require('jest-expo/jest-preset');

// marked and lucide-react-native resolve to ESM builds, so they go through Babel like the React Native packages.
const [nodeModulesPattern, ...otherIgnorePatterns] = expoPreset.transformIgnorePatterns;

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  clearMocks: true,
  resolver: 'react-native-reanimated/jest/resolver',
  transform: {
    ...expoPreset.transform,
    '\\.mjs$': expoPreset.transform['\\.[jt]sx?$'],
  },
  transformIgnorePatterns: [
    nodeModulesPattern.replace('(?!(', '(?!(marked|lucide-react-native|'),
    ...otherIgnorePatterns,
  ],
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test-utils/(.*)$': '<rootDir>/test-utils/$1',
  },
};
