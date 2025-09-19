declare module 'csv-parser' {
  import { Transform } from 'stream';

  interface CsvParserOptions {
    separator?: string | Buffer;
    newline?: string | Buffer;
    quote?: string | Buffer;
    escape?: string | Buffer;
    headers?: string[] | boolean;
    mapHeaders?: (args: { header: string; index: number }) => string | null;
    mapValues?: (args: { header: string; index: number; value: string }) => unknown;
    strict?: boolean;
    skipLines?: number;
  }

  export default function csvParser(options?: CsvParserOptions): Transform;
}
