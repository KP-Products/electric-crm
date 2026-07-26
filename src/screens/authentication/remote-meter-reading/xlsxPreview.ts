type CellValue = string | number | undefined;

export interface ParsedSheetRow {
  rowNumber: number;
  values: Record<string, CellValue>;
}

export interface ParsedSheet {
  headers: string[];
  rows: ParsedSheetRow[];
}

export interface ParsedRemoteMeterReadingWorkbook {
  meterSheet?: ParsedSheet;
  touSheet?: ParsedSheet;
  missingSheets: string[];
}

const METER_SHEET_NAME = 'Du_lieu_cong_to';
const TOU_SHEET_NAME = 'Chi_tiet_TOU';
const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const ZIP_METHOD_STORE = 0;
const ZIP_METHOD_DEFLATE = 8;
const MAX_EOCD_SEARCH = 65557;
const RELATIONSHIP_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

const textDecoder = new TextDecoder('utf-8');

const getUint16 = (view: DataView, offset: number) => view.getUint16(offset, true);
const getUint32 = (view: DataView, offset: number) => view.getUint32(offset, true);

const findEndOfCentralDirectory = (view: DataView) => {
  const minOffset = Math.max(0, view.byteLength - MAX_EOCD_SEARCH);

  for (let offset = view.byteLength - 22; offset >= minOffset; offset -= 1) {
    if (getUint32(view, offset) === EOCD_SIGNATURE) return offset;
  }

  throw new Error('File Excel không đúng định dạng .xlsx');
};

const inflateRaw = async (data: Uint8Array) => {
  const DecompressionStreamConstructor = globalThis.DecompressionStream;

  if (!DecompressionStreamConstructor) {
    throw new Error('Trình duyệt hiện tại chưa hỗ trợ đọc nội dung file Excel để xem trước');
  }

  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStreamConstructor('deflate-raw' as CompressionFormat));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

const readZipEntries = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const endOffset = findEndOfCentralDirectory(view);
  const entryCount = getUint16(view, endOffset + 10);
  const centralDirectoryOffset = getUint32(view, endOffset + 16);
  const entries: Record<string, Uint8Array> = {};
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (getUint32(view, offset) !== CENTRAL_DIRECTORY_SIGNATURE) {
      throw new Error('Không đọc được cấu trúc file Excel');
    }

    const method = getUint16(view, offset + 10);
    const compressedSize = getUint32(view, offset + 20);
    const fileNameLength = getUint16(view, offset + 28);
    const extraLength = getUint16(view, offset + 30);
    const commentLength = getUint16(view, offset + 32);
    const localHeaderOffset = getUint32(view, offset + 42);
    const fileName = textDecoder.decode(bytes.slice(offset + 46, offset + 46 + fileNameLength));

    if (getUint32(view, localHeaderOffset) !== LOCAL_FILE_HEADER_SIGNATURE) {
      throw new Error('Không đọc được dữ liệu trong file Excel');
    }

    const localFileNameLength = getUint16(view, localHeaderOffset + 26);
    const localExtraLength = getUint16(view, localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
    const compressedData = bytes.slice(dataOffset, dataOffset + compressedSize);

    if (method === ZIP_METHOD_STORE) {
      entries[fileName] = compressedData;
    } else if (method === ZIP_METHOD_DEFLATE) {
      entries[fileName] = await inflateRaw(compressedData);
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
};

const readZipText = (entries: Record<string, Uint8Array>, path: string) => {
  const entry = entries[path];
  if (!entry) return '';
  return textDecoder.decode(entry);
};

const parseXml = (xml: string) => {
  const documentXml = new DOMParser().parseFromString(xml, 'application/xml');
  const parserErrors = documentXml.getElementsByTagName('parsererror');

  if (parserErrors.length) {
    throw new Error('Không đọc được XML trong file Excel');
  }

  return documentXml;
};

const getElementsByLocalName = (root: ParentNode, localName: string) =>
  Array.from(root.querySelectorAll('*')).filter((element) => element.localName === localName);

const getChildElementsByLocalName = (root: Element, localName: string) =>
  Array.from(root.children).filter((element) => element.localName === localName);

const getFirstTextByLocalName = (root: Element, localName: string) =>
  getElementsByLocalName(root, localName)[0]?.textContent || '';

const normalizeHeader = (value: CellValue) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const columnIndexFromRef = (ref: string) => {
  const column = ref.replace(/[0-9]/g, '').toUpperCase();
  let index = 0;

  for (let position = 0; position < column.length; position += 1) {
    index = index * 26 + column.charCodeAt(position) - 64;
  }

  return Math.max(index - 1, 0);
};

const parseSharedStrings = (entries: Record<string, Uint8Array>) => {
  const sharedStringsXml = readZipText(entries, 'xl/sharedStrings.xml');
  if (!sharedStringsXml) return [];

  const documentXml = parseXml(sharedStringsXml);
  return getElementsByLocalName(documentXml, 'si').map((item) =>
    getElementsByLocalName(item, 't')
      .map((textNode) => textNode.textContent || '')
      .join('')
  );
};

const parseCellValue = (cell: Element, sharedStrings: string[]): CellValue => {
  const type = cell.getAttribute('t');

  if (type === 'inlineStr') {
    return getFirstTextByLocalName(cell, 't').trim();
  }

  const rawValue = getFirstTextByLocalName(cell, 'v').trim();

  if (type === 's') return sharedStrings[Number(rawValue)] || '';
  if (type === 'str') return rawValue;
  if (!rawValue) return undefined;

  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : rawValue;
};

const parseSheet = (xml: string, sharedStrings: string[]): ParsedSheet => {
  const documentXml = parseXml(xml);
  const rawRows = getElementsByLocalName(documentXml, 'row').map((row) => {
    const rowNumber = Number(row.getAttribute('r')) || 0;
    const cells: CellValue[] = [];

    getChildElementsByLocalName(row, 'c').forEach((cell) => {
      const cellRef = cell.getAttribute('r') || '';
      cells[columnIndexFromRef(cellRef)] = parseCellValue(cell, sharedStrings);
    });

    return {
      rowNumber,
      cells
    };
  });
  const headerIndex = rawRows.findIndex((row) =>
    row.cells.some((cell) => String(cell ?? '').trim())
  );

  if (headerIndex < 0) {
    return {
      headers: [],
      rows: []
    };
  }

  const headers = rawRows[headerIndex].cells.map(normalizeHeader);
  const rows = rawRows.slice(headerIndex + 1).reduce<ParsedSheetRow[]>((acc, row) => {
    const values: Record<string, CellValue> = {};

    headers.forEach((header, index) => {
      if (header) values[header] = row.cells[index];
    });

    if (Object.values(values).some((value) => String(value ?? '').trim())) {
      acc.push({
        rowNumber: row.rowNumber,
        values
      });
    }

    return acc;
  }, []);

  return {
    headers,
    rows
  };
};

const resolveWorkbookTarget = (target?: string | null) => {
  if (!target) return '';
  if (target.startsWith('/')) return target.slice(1);
  if (target.startsWith('xl/')) return target;
  return `xl/${target.replace(/^\.\//, '')}`;
};

const parseSheetPaths = (entries: Record<string, Uint8Array>) => {
  const workbookXml = readZipText(entries, 'xl/workbook.xml');
  const workbookRelsXml = readZipText(entries, 'xl/_rels/workbook.xml.rels');

  if (!workbookXml || !workbookRelsXml) {
    throw new Error('File Excel thiếu workbook metadata');
  }

  const workbookDocument = parseXml(workbookXml);
  const relsDocument = parseXml(workbookRelsXml);
  const relTargets = new Map<string, string>();

  getElementsByLocalName(relsDocument, 'Relationship').forEach((relationship) => {
    const id = relationship.getAttribute('Id');
    if (id) relTargets.set(id, resolveWorkbookTarget(relationship.getAttribute('Target')));
  });

  return getElementsByLocalName(workbookDocument, 'sheet').reduce<Record<string, string>>(
    (acc, sheet) => {
      const name = sheet.getAttribute('name');
      const relationshipId =
        sheet.getAttribute('r:id') || sheet.getAttributeNS(RELATIONSHIP_NS, 'id');
      const target = relationshipId ? relTargets.get(relationshipId) : '';

      if (name && target) acc[name] = target;
      return acc;
    },
    {}
  );
};

export const parseRemoteMeterReadingWorkbook = async (
  file: File
): Promise<ParsedRemoteMeterReadingWorkbook> => {
  const entries = await readZipEntries(file);
  const sharedStrings = parseSharedStrings(entries);
  const sheetPaths = parseSheetPaths(entries);
  const missingSheets = [METER_SHEET_NAME, TOU_SHEET_NAME].filter(
    (sheetName) => !sheetPaths[sheetName]
  );
  const meterSheetXml = sheetPaths[METER_SHEET_NAME]
    ? readZipText(entries, sheetPaths[METER_SHEET_NAME])
    : '';
  const touSheetXml = sheetPaths[TOU_SHEET_NAME]
    ? readZipText(entries, sheetPaths[TOU_SHEET_NAME])
    : '';

  return {
    meterSheet: meterSheetXml ? parseSheet(meterSheetXml, sharedStrings) : undefined,
    touSheet: touSheetXml ? parseSheet(touSheetXml, sharedStrings) : undefined,
    missingSheets
  };
};
