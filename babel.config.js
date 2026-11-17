const isMarked = (filename) => filename != null && /node_modules[\\/]marked[\\/]/.test(filename);

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    overrides: [{ test: isMarked, plugins: ['./babel/keep-native-named-groups'] }],
  };
};
