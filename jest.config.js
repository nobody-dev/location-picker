module.exports = {
    transform: {
        '^.+\\.vue$': 'vue-jest',
        '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
        '^.+\\.jsx?$': 'babel-jest',
    },

    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
    snapshotSerializers: ['jest-serializer-vue'],
    testMatch: ['**/*.spec.js'],
    testURL: 'http://localhost/',
    watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
    transformIgnorePatterns: ['node_modules/(?!@n1/ui-kit)'],
};
