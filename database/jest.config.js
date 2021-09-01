/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
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
