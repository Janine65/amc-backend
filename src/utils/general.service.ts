import { CellValue, Worksheet } from 'exceljs';

export const iFontSizeHeader = 18;
export const iFontSizeTitel = 14;
export const iFontSizeRow = 13;

/**
 * @param {ExcelJS.Worksheet} sheet Excel Worksheet
 * @param {*} value value to fill in cell
 * @param {Boolean} border Set thin boarder line
 * @param {Boolean} merge Merge the cells
 */
export function setCellValueFormat(
  sheet: Worksheet,
  range: string,
  value: CellValue,
  border: boolean | undefined,
  merge: string | undefined,
  font: object | undefined,
) {
  const cell = sheet.getCell(range);
  cell.value = value;
  if (merge) {
    sheet.mergeCells(merge);
  }

  if (border)
    cell.border = {
      top: {
        style: 'thin',
      },
      left: {
        style: 'thin',
      },
      bottom: {
        style: 'thin',
      },
      right: {
        style: 'thin',
      },
    };

  if (font) cell.font = font;
}

/**
 * Function to format a date in a long German date
 *
 * @param {Date} date The date
 * @returns {string} The formatted date
 */
export function formatDateLong(date: Date): string {
  let retString = '';

  const months = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ];

  const monthName = months[date.getMonth()];

  retString = date.getDate() + '. ' + monthName + ' ' + date.getFullYear();
  return retString;
}
