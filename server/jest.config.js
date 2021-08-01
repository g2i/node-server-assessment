/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: 'node',
  reporters: [
    "default",
    "<rootDir>/../reporter/dist/index.js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ]
};