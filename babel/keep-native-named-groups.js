// @react-native/babel-preset rewrites named capture groups into numbered ones. marked composes
// its regexes from each other's `.source`, which shifts the numbers and breaks backreferences
// (e.g. bold text after inline code is no longer parsed). Hermes supports named groups natively,
// so these literals are turned into RegExp constructor calls that the preset leaves untouched.
const namedGroup = /\(\?<(?![=!])/;

module.exports = function keepNativeNamedGroups({ types: t }) {
  return {
    name: 'keep-native-named-groups',
    visitor: {
      RegExpLiteral(path) {
        const { pattern, flags } = path.node;
        if (!namedGroup.test(pattern)) return;
        path.replaceWith(
          t.newExpression(t.identifier('RegExp'), [
            t.stringLiteral(pattern),
            t.stringLiteral(flags),
          ]),
        );
      },
    },
  };
};
