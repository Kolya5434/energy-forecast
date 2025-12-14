/**
 * Preload export libraries on hover to improve UX
 * Libraries are loaded in the background before user clicks export button
 */

let xlsxPromise: Promise<typeof import('xlsx')> | null = null;
let jspdfPromise: Promise<[typeof import('jspdf'), typeof import('jspdf-autotable')]> | null = null;
let docxPromise: Promise<typeof import('docx')> | null = null;

export const preloadXlsx = () => {
  if (!xlsxPromise) {
    xlsxPromise = import('xlsx');
  }
  return xlsxPromise;
};

export const preloadJspdf = () => {
  if (!jspdfPromise) {
    jspdfPromise = Promise.all([import('jspdf'), import('jspdf-autotable')]);
  }
  return jspdfPromise;
};

export const preloadDocx = () => {
  if (!docxPromise) {
    docxPromise = import('docx');
  }
  return docxPromise;
};

export const preloadAllExportLibs = () => {
  preloadXlsx();
  preloadJspdf();
  preloadDocx();
};
