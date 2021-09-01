/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: 'node',
  reporters: [
    "default",
    "cli-jest-reporter"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ]
};
