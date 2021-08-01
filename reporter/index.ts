import { Reporter, DefaultReporter, Config, Context, AggregatedResult } from '@jest/reporters';

export default class G2iReporter implements Reporter {
  #globalConfig: Config.GlobalConfig;
  #options: Record<string, unknown>;

  constructor(globalConfig: Config.GlobalConfig, options: Record<string, unknown>) {
    this.#globalConfig = globalConfig;
    this.#options = options;
  }

  onRunStart(): void {}
  onRunComplete(contexts: Set<Context>, results: AggregatedResult) {
    console.log(`result=${results.numPassedTests / results.numTotalTests}`)
  }
  getLastError(): void {}
}