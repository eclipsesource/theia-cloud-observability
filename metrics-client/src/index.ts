import { writeFileSync } from 'fs';
import fetch from 'node-fetch';

const prometheusUrl = 'http://localhost:9090//api/v1';
const exampleQuery = 'process_start_time_seconds{namespace="theiacloud"}';
const start = '2024-07-10T08:00:00.000Z';
const end = '2024-07-10T08:30:00.000Z';
const step = '10s';

const queryPrometheus = async (
  query: string,
  start: string,
  end: string,
  step: string,
) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.set('query', query);
    urlParams.set('start', start);
    urlParams.set('end', end);
    urlParams.set('step', step);

    const response = await fetch(
      `${prometheusUrl}/query_range?${urlParams.toString()}`,
    );
    const data: any = await response.json();
    if (data.status === 'success') {
      return data.data.result;
    } else {
      throw new Error(`Query failed: ${data.error}`);
    }
  } catch (error) {
    console.error(`Error querying Prometheus: ${error.message}`);
    throw error;
  }
};

const main = async () => {
  try {
    const metrics = await queryPrometheus(exampleQuery, start, end, step);
    console.log('Metrics:', metrics);
    writeFileSync('./metrics', JSON.stringify(metrics, undefined, 2));

    // Perform calculations on metrics
    // Example: Calculate the average value
    // const values = metrics.map((metric: any) => parseFloat(metric.value[1]));
    // const average =
    //   values.reduce((sum: number, value: number) => sum + value, 0) /
    //   values.length;
    // console.log('Average value:', average);
  } catch (error) {
    console.error('Failed to fetch or process metrics:', error);
  }
};

main().catch(console.error);
