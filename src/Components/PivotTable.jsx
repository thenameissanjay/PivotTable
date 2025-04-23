import React, { useEffect, useState } from 'react';

const PivotTable = ({ data, rowLevels = 2, aggregation }) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setIsDataLoaded(true);
    }
  }, [data]);

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
      const aggType = aggregation[key];
      if (aggType && typeof node[key]?.[aggType] === 'number') {
        const rowKey = keys.slice(0, rowLevels).join('|');
        const colKeyParts = keys.slice(rowLevels);
        const colKey = [...colKeyParts, `${key} (${aggType})`].join(' → ');

        tableData[rowKey] ??= {};
        tableData[rowKey][colKey] = node[key][aggType];
        colHeadersSet.add(colKey);
      } else if (typeof node[key] === 'object') {
        traverse(node[key], [...keys, key]);
      }
    }
  };

  if (isDataLoaded) {
    traverse(data);
  }

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

  const getColumnTotal = (colKey) => {
    let total = 0;
    for (const rowKey in tableData) {
      if (tableData[rowKey][colKey] !== undefined) {
        total += tableData[rowKey][colKey];
      }
    }
    return total.toFixed(2); // Round the total to two decimal places
  };

  if (!isDataLoaded) {
    return <div></div>;
  }

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
                  style={{ minWidth: '150px', maxWidth: '150px', width: '150px' }}
                >
                  {cell.label.includes('→') ? (
                    <>
                      {cell.label.split(' → ')[0]}<br />
                      <span className="text-sm">{cell.label.split(' → ')[1]}</span>
                    </>
                  ) : (
                    cell.label
                  )}
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
                        style={{ minWidth: '150px', maxWidth: '150px', width: '150px' }}
                      >
                        {val}
                      </td>
                    );
                  }
                  return null;
                })}
                {colHeaders.map((col, j) => {
                  const colKey = colHeaders[j];
                  const aggValue = tableData[rowKey]?.[colKey] ?? '';
                  const roundedAggValue = typeof aggValue === 'number' ? aggValue.toFixed(2) : aggValue;
                  return (
                    <td
                      key={j}
                      className="border-2 border-gray-400 px-4 py-2 text-center"
                      style={{ minWidth: '150px', maxWidth: '150px', width: '150px' }}
                    >
                      {roundedAggValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td className="border-2 border-gray-400 px-4 py-2 font-semibold text-center" colSpan={rowLevels} style={{ minWidth: '150px', maxWidth: '150px', width: '150px' }}>
              Total
            </td>
            {colHeaders.map((col, idx) => (
              <td
                key={`footer-${idx}`}
                className="border-2 border-gray-400 px-4 py-2 text-center font-semibold bg-gray-50"
                style={{ minWidth: '150px', maxWidth: '150px', width: '150px' }}
              >
                {getColumnTotal(col)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default PivotTable;
