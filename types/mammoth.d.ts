declare module "mammoth" {
  export interface ConversionResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  export interface Options {
    buffer?: Buffer;
    path?: string;
  }

  export function convertToHtml(input: Options): Promise<ConversionResult>;
}
