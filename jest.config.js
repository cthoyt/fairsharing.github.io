module.exports = {
    preset: "@vue/cli-plugin-unit-jest",
    collectCoverage: true,
    coverageReporters: [
        "lcov"
    ],
    collectCoverageFrom: [
        "src/**/*.{js,vue}",
        "!src/main.js",
        "!src/utils/utils.js",
        "!src/documentation/process_doc.js",
        "!src/store/index.js",
        "!src/plugins/**",
        "!src/router/routes.js"
    ],
    testMatch: [
        "**/**.spec.js", "**/**/**.spec.js", "tests/**/**.spec.js", "tests/**/**/**.spec.js"
    ],
    setupFiles: [
      "./jest-setup.js",
      "trace-unhandled/register"
    ],
    "moduleFileExtensions": [
        "js",
        "json",
        "vue"
    ],
    transform: {
        '^.*\\.js$': 'babel-jest',
        '.*\\.(vue)$': 'vue-jest'
    },
    transformIgnorePatterns: [
        'node_modules/(?!vue-router|@babel|vuetify|vue2-particles)',
    ]
};
