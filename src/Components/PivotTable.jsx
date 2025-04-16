import React from 'react';

const PivotTable = ({ data, rowLevels = 2, aggregation }) => {
  const rowHeaders = [];
  const colHeadersSet = new Set();
  const tableData = {};

  const traverse = (node, keys = []) => {
    if (typeof node !== 'object' || node === null) return;

    const level = keys.length;
    if (level === rowLevels) {
      const rowKey = keys.slice(0, rowLevels).join('|');
      if (!tableData[rowKey]) tableData[rowKey] = {};
      if (!rowHeaders.some(r => r.join('|') === rowKey)) {
        rowHeaders.push(keys.slice(0, rowLevels));
      }
    }

    for (const key in node) {
      const newKeys = [...keys, key];
      if (typeof node[key]?.[aggregation] === 'number') {
        const rowKey = newKeys.slice(0, rowLevels).join('|');
        const colKeyParts = newKeys.slice(rowLevels);
        const colKey = colKeyParts.join(' → ');
        tableData[rowKey][colKey] = node[key][aggregation];
        colHeadersSet.add(colKey);
      } else {
        traverse(node[key], newKeys);
      }
    }
  };

  traverse(data);

  const colHeaders = Array.from(colHeadersSet);

  const colHeaderLevels = colHeaders.map(h => h.split(' → '));
  const maxDepth = Math.max(...colHeaderLevels.map(h => h.length));

  const headerMatrix = Array.from({ length: maxDepth }, () => []);
  for (let level = 0; level < maxDepth; level++) {
    let prev = null;
    for (let i = 0; i < colHeaderLevels.length; i++) {
      const parts = colHeaderLevels[i];
      const label = parts[level] || '';
      if (label === prev && headerMatrix[level].length > 0) {
        headerMatrix[level][headerMatrix[level].length - 1].colSpan++;
      } else {
        headerMatrix[level].push({ label, colSpan: 1 });
        prev = label;
      }
    }
  }

  const getRowSpan = (rows, rowIndex, colIndex) => {
    const current = rows[rowIndex][colIndex];
    let span = 1;
    for (let i = rowIndex + 1; i < rows.length; i++) {
      if (rows[i][colIndex] === current) {
        span++;
      } else break;
    }
    return span;
  };

  return (
    <div className="overflow-auto p-4 max-h-[80vh]">
      <table className="table-auto border-collapse border-2 border-gray-400 w-full text-sm">
        <thead className="bg-white z-10 shadow-md border-b-2 border-gray-400">
          {headerMatrix.map((level, i) => (
            <tr key={i}>
              {i === 0 &&
                Array.from({ length: rowLevels }).map((_, j) => (
                  <th
                    key={`row-${j}`}
                    className={`border-2 border-gray-400 bg-gray-100 text-left font-semibold ${j === rowLevels - 1 ? 'border-r-2' : ''}`}
                    style={{ left: `${j * 150}px`, zIndex: 5 }}
                    rowSpan={maxDepth}
                  >
                    {j === 0 ? 'Product' : j === 1 ? 'Region' : ''}
                  </th>
                ))}
              {level.map((cell, idx) => (
                <th
                  key={idx}
                  colSpan={cell.colSpan}
                  className="border-2 border-gray-400 px-4 py-2 bg-gray-100 text-center font-semibold"
                >
                  {cell.label}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rowHeaders.map((row, rowIndex) => {
            const rowKey = row.join('|');
            return (
              <tr key={rowIndex}>
                {row.map((val, colIndex) => {
                  if (
                    rowIndex === 0 ||
                    rowHeaders[rowIndex - 1][colIndex] !== val
                  ) {
                    const rowSpan = getRowSpan(rowHeaders, rowIndex, colIndex);
                    return (
                      <td
                        key={colIndex}
                        rowSpan={rowSpan}
                        className={`border-2 border-gray-400 px-4 py-2 bg-gray-100 left-${colIndex * 150}px z-5 font-medium ${colIndex === rowLevels - 1 ? 'border-r-2 border-gray-400' : ''}`}
                        style={{ minWidth: '150px' }}
                      >
                        {val}
                      </td>
                    );
                  }
                  return null;
                })}
                {colHeaders.map((col, j) => (
                  <td
                    key={j}
                    className="border-2 border-gray-400 px-4 py-2 text-center"
                  >
                    {tableData[rowKey][col] ?? ''}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PivotTable;