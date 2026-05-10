type SimpleTableProps = {
  columns: string[];
  rows: Array<Array<string>>;
};

export function SimpleTable({ columns, rows }: SimpleTableProps) {
  return (
    <table className="simple-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={`${index}-${cellIndex}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
