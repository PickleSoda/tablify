import {
  getCellsByTableId,
} from "@/lib/db/queries";

function structureTableData(cellsData: any[]) {
  const structuredData: any = {};
  cellsData.forEach(({ rowId, columnName, cellValue }) => {
    if (!structuredData[rowId]) {
      structuredData[rowId] = {};
    }
    structuredData[rowId][columnName] = cellValue;
  });
  return structuredData;
}

export async function TableComponent({ tableId }: { tableId: number }) {
  const cellsData = await getCellsByTableId(tableId);
  const structuredData = structureTableData(cellsData);

  return (
    <table>
      <thead>
        <tr>
          {Object.keys(
            structuredData[Object.keys(structuredData)[0]] || {}
          ).map((colName) => (
            <th key={colName}>{colName}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(structuredData).map(([rowId, columns]) => (
          <tr key={rowId}>
            {Object.entries(columns).map(([colName, value]) => (
              <td key={colName}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
