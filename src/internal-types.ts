import { DataSource } from './types';

export type ExtractResultType<DS> = DS extends DataSource<infer R> ? R : never;
