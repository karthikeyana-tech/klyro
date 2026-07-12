# This file contains type declarations needed by pdf-parse
declare module "pdf-parse" {
  interface PDFData {
    text: string;
    numpages: number;
    info: Record<string, unknown>;
  }
  
  function pdfParse(buffer: Buffer): Promise<PDFData>;
  export default pdfParse;
}
