import { getAllSubmittedData } from "@/app/data/tiles";
import { ExcelData, ExcelDataInd, Item, SubmittedItems, Tile, Total } from "@/app/data/types";
import { getDbUser } from "@/app/data/user";
import { formatDateDDMMYYYY } from "@/lib/date";
import * as XLSX from "xlsx-js-style";

const toNumber = (value: number | string | undefined | null) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

function sanitizeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_").trim() || "Download";
}

function triggerExcelDownload(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = sanitizeFilename(filename);
  a.click();
  window.URL.revokeObjectURL(url);
}

async function getFlattenedSubmittedTiles(ids: string[]) {
  const data = await getAllSubmittedData(ids);
  return data.flat();
}

function applyTableFeatures<T extends object>(
  sheet: XLSX.WorkSheet,
  rows: T[],
  startCol = 1,
  startRow = 6,
) {
  if (rows.length === 0) return;

  const keys = Object.keys(rows[0] as object);
  const widths = keys.map((key) => {
    const maxCell = rows.reduce((max, row) => {
      const value = (row as Record<string, unknown>)[key];
      const text = value === undefined || value === null ? "" : String(value);
      return Math.max(max, text.length);
    }, key.length);
    return { wch: Math.min(Math.max(maxCell + 2, 10), 40) };
  });

  const prefixCols = Array.from({ length: startCol }, () => ({ wch: 2 }));
  sheet["!cols"] = [...prefixCols, ...widths];

  const endCol = startCol + keys.length - 1;
  const endRow = startRow + rows.length;
  sheet["!autofilter"] = {
    ref: `${XLSX.utils.encode_col(startCol)}${startRow}:${XLSX.utils.encode_col(endCol)}${endRow}`,
  };

  applyTableBorders(sheet, keys, startCol, endCol, startRow, endRow);
  applyColumnHeaderBold(sheet, startCol, endCol, startRow);
}

function applyTableBorders(
  sheet: XLSX.WorkSheet,
  keys: string[],
  startCol: number,
  endCol: number,
  startRow: number,
  endRow: number,
) {
  const border = {
    top: { style: "thin", color: { rgb: "BFC5D1" } },
    bottom: { style: "thin", color: { rgb: "BFC5D1" } },
    left: { style: "thin", color: { rgb: "BFC5D1" } },
    right: { style: "thin", color: { rgb: "BFC5D1" } },
  };
  for (let row = startRow; row <= endRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      const key = keys[col - startCol] || "";
      const alignment = {
        horizontal: key === "CODE" ? "left" : "center",
        vertical: "center",
        wrapText: true,
      } as const;
      const ref = XLSX.utils.encode_cell({ r: row - 1, c: col });
      const cell = sheet[ref] || { t: "s", v: "" };
      (cell as XLSX.CellObject & { s?: unknown }).s = {
        ...((cell as XLSX.CellObject & { s?: Record<string, unknown> }).s || {}),
        border,
        alignment,
      };
      sheet[ref] = cell;
    }
  }
}

function applyColumnHeaderBold(
  sheet: XLSX.WorkSheet,
  startCol: number,
  endCol: number,
  headerRow: number,
) {
  for (let col = startCol; col <= endCol; col += 1) {
    const ref = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
    const cell = sheet[ref];
    if (!cell) continue;
    (cell as XLSX.CellObject & { s?: unknown }).s = {
      ...((cell as XLSX.CellObject & { s?: Record<string, unknown> }).s || {}),
      font: {
        ...(((cell as XLSX.CellObject & { s?: { font?: Record<string, unknown> } }).s?.font) || {}),
        bold: true,
      },
    };
  }
}

function addMergedHeaderRows(
  sheet: XLSX.WorkSheet,
  createdBy: string,
  includeFooterLine: boolean,
) {
  const startCol = 1; // B
  const endCol = 6; // G
  const startRow = 1; // row 2

  const formattedDate = formatDateDDMMYYYY(new Date());
  const headerLines = [
    "Tile Inventory Report",
    `Created By: ${createdBy}`,
    ...(includeFooterLine ? ["Developed by Coders Cottage"] : []),
    `Date: ${formattedDate}`,
  ];

  // Add header rows as plain text first.
  XLSX.utils.sheet_add_aoa(
    sheet,
    [...headerLines.map((line) => [line]), [""]],
    { origin: "B2" },
  );

  // Merge each header line across the same column span for a clean block look.
  const merges = sheet["!merges"] || [];
  for (let i = 0; i < headerLines.length; i += 1) {
    const row = startRow + i;
    merges.push({
      s: { r: row, c: startCol },
      e: { r: row, c: endCol },
    });
  }
  sheet["!merges"] = merges;

  // Bold merged header lines.
  for (let i = 0; i < headerLines.length; i += 1) {
    const row = startRow + i;
    const ref = XLSX.utils.encode_cell({ r: row, c: startCol });
    const cell = sheet[ref];
    if (!cell) continue;
    (cell as XLSX.CellObject & { s?: unknown }).s = {
      ...((cell as XLSX.CellObject & { s?: Record<string, unknown> }).s || {}),
      font: {
        ...(((cell as XLSX.CellObject & { s?: { font?: Record<string, unknown> } }).s?.font) || {}),
        bold: true,
      },
    };
  }

  // Return first row index (1-based) where table header should start.
  return headerLines.length + 3;
}

export async function tilesToExcel(submits: SubmittedItems) {
  const plainData: ExcelDataInd[] = [];

  const creator = submits.items[0]?.items[0]?.createdBy || "Unknown";
  const user = await getDbUser(creator);

  let index = 0;
  submits.items.forEach((tile) => {
    const nestedItems = tile.items || [];
    nestedItems.forEach((item) => {
      index += 1;
      plainData.push({
        INDEX: index,
        CODE: tile.code,
        SIZE: tile.size,
        GRID: item.grid,
        HISTORY: item.history,
        TOTAL: toNumber(item.quantity),
      });
    });
  });

  plainData.sort((a, b) => {
    const codeCompare = a.CODE.localeCompare(b.CODE);
    if (codeCompare !== 0) return codeCompare;
    return a.GRID.localeCompare(b.GRID);
  });

  plainData.forEach((row, idx) => {
    row.INDEX = idx + 1;
  });

  if (plainData.length === 0) return;

  const sheet = XLSX.utils.aoa_to_sheet([]);
  const tableStartRow = addMergedHeaderRows(
    sheet,
    `${user?.name || "Unknown"} (${user?.id || creator})`,
    false,
  );

  XLSX.utils.sheet_add_json(sheet, plainData, { origin: `B${tableStartRow}` });
  applyTableFeatures(sheet, plainData, 1, tableStartRow);

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Tiles List");

  const buffer = XLSX.write(book, { bookType: "xlsx", type: "array" });
  const filename = `${user?.name || "Unknown"} (${user?.id || creator}).xlsx`;
  triggerExcelDownload(buffer, filename);
}

export async function mergeAll(ids: string[]): Promise<Tile[]> {
  const tiles = await getFlattenedSubmittedTiles(ids);
  const tileMap = new Map<string, Tile>();
  const gridMapByCode = new Map<string, Map<string, Item>>();

  for (const tile of tiles) {
    const existingTile = tileMap.get(tile.code);
    if (!existingTile) {
      const clonedItems = tile.items.map((item) => ({
        ...item,
        quantity: String(toNumber(item.quantity)),
      }));

      const nextTile: Tile = {
        ...tile,
        items: clonedItems,
        quantity: clonedItems.reduce((sum, item) => sum + toNumber(item.quantity), 0),
      };

      tileMap.set(tile.code, nextTile);
      gridMapByCode.set(tile.code, new Map(clonedItems.map((item) => [item.grid, item])));
      continue;
    }

    const gridMap = gridMapByCode.get(tile.code) || new Map<string, Item>();
    for (const incoming of tile.items) {
      const existingGrid = gridMap.get(incoming.grid);
      if (!existingGrid) {
        const nextItem: Item = {
          ...incoming,
          quantity: String(toNumber(incoming.quantity)),
        };
        existingTile.items.push(nextItem);
        gridMap.set(incoming.grid, nextItem);
        continue;
      }

      existingGrid.quantity = String(toNumber(existingGrid.quantity) + toNumber(incoming.quantity));
      const normalizedHistory = (incoming.history || "").replace(/^=/, "");
      existingGrid.history = normalizedHistory
        ? `${existingGrid.history || ""}+${normalizedHistory}`
        : existingGrid.history;
    }

    existingTile.quantity = existingTile.items.reduce((sum, item) => sum + toNumber(item.quantity), 0);
    gridMapByCode.set(tile.code, gridMap);
  }

  return Array.from(tileMap.values());
}

export async function downloadTotal(ids: string[]) {
  const tiles = await getFlattenedSubmittedTiles(ids);
  const totalsByCode = new Map<string, number>();

  for (const tile of tiles) {
    const tileTotal = tile.items.reduce((sum, item) => sum + toNumber(item.quantity), 0);
    totalsByCode.set(tile.code, (totalsByCode.get(tile.code) || 0) + tileTotal);
  }

  const sortedEntries = Array.from(totalsByCode.entries()).sort(([a], [b]) => a.localeCompare(b));
  const flatData: Total[] = sortedEntries.map(([code, quantity], index) => ({
    INDEX: index + 1,
    CODE: code,
    QUANTITY: quantity,
  }));

  exportToExcel(flatData, ids, "Total Quantity");
}

export async function donwloadDetailed(ids: string[]) {
  const mergedTile = await mergeAll(ids);
  let rowIndex = 0;
  const flatData: ExcelData[] = [];

  mergedTile
    .sort((a, b) => a.code.localeCompare(b.code))
    .forEach((tile) => {
      tile.items
        .sort((a, b) => a.grid.localeCompare(b.grid))
        .forEach((item) => {
          rowIndex += 1;
          flatData.push({
            INDEX: rowIndex,
            CODE: tile.code,
            SIZE: tile.size,
            GRID: item.grid,
            HISTORY: item.history,
            TOTAL: toNumber(item.quantity),
          });
        });
    });

  exportToExcel(flatData, ids, "Detailed Submits");
}

export function exportToExcel(
  items: Array<ExcelData | Total>,
  ids: string[],
  sheetName = "Merged sheet",
) {
  const sheet = XLSX.utils.aoa_to_sheet([]);
  const tableStartRow = addMergedHeaderRows(sheet, ids.join(", "), true);

  XLSX.utils.sheet_add_json(sheet, items, { origin: `B${tableStartRow}` });
  applyTableFeatures(sheet, items, 1, tableStartRow);

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName);

  const buffer = XLSX.write(book, { bookType: "xlsx", type: "array" });
  triggerExcelDownload(buffer, `${sheetName}.xlsx`);
}
