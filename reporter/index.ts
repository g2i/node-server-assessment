import { Reporter, DefaultReporter, Config, Context, AggregatedResult } from '@jest/reporters';

// TODO - Bummer can't find types with PNP?  AggregatedResult["testResult"] 
function buildSummary(results: AggregatedResult) {
  let summary: string[] = [];
  results.testResults.forEach(({ testResults }: any) => 
    testResults.forEach((result: any) => 
      summary.push(`${result.status === 'passed' ? '✓' : '✕'} ${result.fullName}`
      )
    )
  );

  return `START_SUMMARY\n${summary.join('\n')}\nEND_SUMMARY`;
}

export default class G2iReporter implements Reporter {
  #globalConfig: Config.GlobalConfig;
  #options: Record<string, unknown>;

  constructor(globalConfig: Config.GlobalConfig, options: Record<string, unknown>) {
    this.#globalConfig = globalConfig;
    this.#options = options;
  }

  onRunStart(): void {}
  onRunComplete(_contexts: Set<Context>, results: AggregatedResult) {
    console.log(buildSummary(results));
    console.log(`result=${results.numPassedTests / results.numTotalTests}`)
  }
  getLastError(): void {}
}
