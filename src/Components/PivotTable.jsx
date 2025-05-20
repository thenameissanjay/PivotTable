import React, { useEffect, useState, useContext } from 'react';
import { CsvContext } from '../Context/Context';
import { Sparkles } from 'lucide-react';
 
const PivotTable = ({ data, rowLevels, aggregation = {} }) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { rows } = useContext(CsvContext);
 
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setIsDataLoaded(true);
      console.log(data)
    }
  }, [data]);
 
  let rowHeaders = [];  // [Product , Region]
  const colHeadersSet = new Set();  // Month → Category → Sales (sum)).
  let tableData = {}; /**
  tableData = {
    "Product A | Region 1": {
      "January → Cat X → Sales (sum)": 200
    }
  }
     */
 
  const traverse = (node, keys = []) => {
    if (typeof node !== 'object' || node === null) return;
  
    for (const key in node) {
      const value = node[key];
      const aggType = aggregation[key];
  
      if (
        aggType &&
        typeof value === 'object' &&
        typeof value[aggType] === 'number'
      ) {
        const rowKeyArr = keys.slice(0, rowLevels);
        const rowKey = rowKeyArr.join('|');
  
        if (
          rowKeyArr.length === rowLevels && // <-- Only push if full row key
          !rowHeaders.some(r => r.join('|') === rowKey)
        ) {
          rowHeaders.push(rowKeyArr);
        }
  
        const colKeyParts = keys.slice(rowLevels);
        const colKey =
          colKeyParts.length > 0
            ? [...colKeyParts, `${key} (${aggType})`].join(' → ')
            : `${key} (${aggType})`;
  
        tableData[rowKey] ??= {};
        tableData[rowKey][colKey] = value[aggType];
        colHeadersSet.add(colKey);
      } else if (typeof value === 'object') {
        const rowKeyArr = [...keys, key].slice(0, rowLevels);
        const rowKey = rowKeyArr.join('|');
  
        if (
          rowLevels > 0 &&
          rowKeyArr.length === rowLevels && // <-- Only push if full row key
          !rowHeaders.some(r => r.join('|') === rowKey)
        ) {
          rowHeaders.push(rowKeyArr);
        }
  
        traverse(value, [...keys, key]);
      }
    }
  };
  


  if (isDataLoaded) {
    traverse(data);

  }
 
  const colHeaders = Array.from(colHeadersSet).sort();
  /**
   * [
  "2024 → Profit (sum)",
  "2024 → Sales (sum)",
  "2025 → Sales (sum)"
  ]
   */
  const colHeaderLevels = colHeaders.map(h => h.split(' → '));
  /**[
  ["2024", "Profit (sum)"],
  ["2024", "Sales (sum)"],
  ["2025", "Sales (sum)"]
] */
  const maxDepth = Math.max(...colHeaderLevels.map(h => h.length), 1);
 
  const headerMatrix = Array.from({ length: maxDepth }, () => []);
/**
 * [
  [ // Level 0
    { label: "2024", colSpan: 2 },
    { label: "2025", colSpan: 1 }
  ],
  [ // Level 1
    { label: "Profit (sum)", colSpan: 1 },
    { label: "Sales (sum)", colSpan: 1 },
    { label: "Sales (sum)", colSpan: 1 }
  ]
]
 */
 
  for (let level = 0; level < maxDepth; level++) {
    let prev = null;
    for (let i = 0; i < colHeaderLevels.length; i++) {
      const parts = colHeaderLevels[i];
      const label = parts[level];
      if (label === prev) {
        headerMatrix[level][headerMatrix[level].length - 1].colSpan++;
      } else {
        headerMatrix[level].push({ label, colSpan: 1 });
        prev = label;
      }
    }
  }
 
  const uniqueLeafColumns = [];
  const seenLeafColumns = new Set();
 
  colHeaderLevels.forEach(parts=>{
 
    const lastPart = parts[parts.length - 1];
    const match = lastPart.match(/^(.*?) \((sum|avg|count|min|max)\)$/);
   
    if (match) {
      const key = `${match[1]}_${match[2]}`;
      if (!seenLeafColumns.has(key)) {
        seenLeafColumns.add(key);
        uniqueLeafColumns.push({
          baseName: match[1],                       // Sales
          aggType: match[2],                        // sum
          displayName: `${match[1]} (${match[2]})`, // Sales (sum)
        });
      }
    }
  });
 
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
 
 
  if (!isDataLoaded) return <div></div>;
  if (rowHeaders.length === 0) rowHeaders.push([""]);
 
  return (
    <div className="overflow-auto p-4 max-h-[90vh]">
      <h2 className="text-center text-xl font-semibold mb-4">Pivot Table</h2>
      <table className="table-auto border-collapse border-2 border-gray-400 w-full text-sm">
        <thead className="bg-white z-10 shadow-md border-b-2 border-gray-400">
          {headerMatrix.map((level, i) => (
            <tr key={i}>
              {rowLevels === 0  && (
                <th className="border-2 border-gray-400 px-4 py-2 bg-gray-100 text-center" style={{ width: '300px' }}></th>
              )}
 
              {rowLevels > 0 && i === 0 &&
                Array.from({ length: rowLevels }).map((_, j) => (
                  <th
                    key={`row-${j}`}
                    rowSpan={headerMatrix.length}
                    className="border-2 border-gray-400 px-4 py-2 bg-gray-100 text-center font-semibold whitespace-nowrap"
                    style={{ width: '300px' }}
                  >
                    {rows[j]}
                  </th>
                ))
              }
             
              {level.map((cell, i) => (
                <th
                  key={i}
                  colSpan={cell.colSpan}
                  className="border-2 border-gray-400 px-4 py-2 bg-gray-100 text-center font-semibold whitespace-nowrap"
                  style={{ width: '150px' }}
                >
                  {cell.label}
                </th>
              ))}
             
              {/* Add unique total columns for leaf nodes in the last header row */}
              {i === 0 && uniqueLeafColumns.map((col, idx) => (
                <th
                  key={idx}
                  rowSpan={headerMatrix.length}
                  className="border-2 border-gray-400 px-4 py-2 bg-gray-100 text-center font-semibold whitespace-nowrap"
                  style={{ width: '150px',backgroundColor: '#d4d4d4' }}
                >
                  Total {col.displayName}
                </th>
              ))}
            </tr>
          ))}
        </thead>
 
        <tbody>
          {rowLevels === 0 ? (
            // if no rowHeaders , print tableData[''][colheader]
            <tr>
              <td className="border-2 border-gray-400 px-4 py-2 bg-gray-100 text-center font-medium whitespace-nowrap" style={{ width: '150px' }}></td>
              {colHeaders.map((col, j) => (
                <td
                  key={j}
                  className="border-2 border-gray-400 px-4 py-2 text-center whitespace-nowrap"
                  style={{ width: '150px' }}
                >
                  {tableData['']?.[col]?.toFixed(2) ?? ''}
                </td>
              ))}
              {/* Unique total columns for leaf nodes */}
              {uniqueLeafColumns.map((col, idx) => {
                // Find all columns that match this baseName and aggType
                const matchingColumns = colHeaders.filter(c => {
                  const parts = c.split(' → ');
                  const lastPart = parts[parts.length - 1];
                  return lastPart === `${col.displayName}`;
                });
 
                // Calculate combined total for all matching columns
                let total = 0;
                let count = 0;
                let max = Number.POSITIVE_INFINITY;
                let min = Number.NEGATIVE_INFINITY;
 
                matchingColumns.forEach(matchCol => {
                  const value = tableData['']?.[matchCol];
                  if (typeof value === 'number') {
                    total += value;
                    count++;
                    if (value > max) {
                      max = value;
                      }
                     if(value<min){
                     min=value
                     }
                  }
                });
 
                const displayValue = count > 0 ?
                                   (col.aggType === 'avg' ? total / count :
                                    col.aggType === 'sum' ? total :  
                                    col.aggType === 'max' ? max :
                                    col.aggType === 'min' ? min : count )
                                   : null;
                return (
                  <td
                    key={`total-${idx}`}
                    className="border-2 border-gray-400 px-4 py-2 text-center font-medium whitespace-nowrap"
                    style={{ width: '150px',backgroundColor: '#d4d4d4' }}
                    >
                    {displayValue !== null ? displayValue.toFixed(2) : ''}
                  </td>
                );
              })}
            </tr>
          ) : (
            rowHeaders.map((row, rowIndex) => {
              // if row header print in <td>
              const rowKey = row.join('|');
              return (
                <tr key={rowIndex}>
                  {row.map((val, colIndex) => {
                    if (rowIndex === 0 || rowHeaders?.[rowIndex - 1][colIndex] !== val) {
                      const rowSpan = getRowSpan(rowHeaders, rowIndex, colIndex);
                      return (
                        <td
                          key={colIndex}
                          rowSpan={rowSpan}
                          className="border-2 border-gray-400 px-4 py-2 bg-gray-100 text-center font-medium whitespace-nowrap"
                          style={{ width: '150px' }}
                        >
                          {val}
                        </td>
                      );
                    }
                    return null;
                  })}
                 
                  {colHeaders.map((col, j) => {
                    const value = tableData[rowKey]?.[col] ?? '';
                    const displayVal = typeof value === 'number' ? value.toFixed(2) : value;
                    return (
                      <td
                        key={j}
                        className="border-2 border-gray-400 px-4 py-2 text-center whitespace-nowrap"
                        style={{ width: '150px' }}
                      >
                        {displayVal || 0}
                      </td>
                    );
                  })}
                 
                  {/* Unique total columns for leaf nodes */}
                  {uniqueLeafColumns.map((col, idx) => {
                    // Find all columns that match this baseName and aggType
                    const matchingColumns = colHeaders.filter(c => {
                      const parts = c.split(' → ');
                      const lastPart = parts[parts.length - 1];
                      return lastPart === `${col.displayName}`;
                    });
 
                    // Calculate combined total for all matching columns
                    let total = 0;
                    let count = 0;
                    matchingColumns.forEach(matchCol => {
                      const value = tableData[rowKey]?.[matchCol];
                      if (typeof value === 'number') {
                        total += value;
                        count++;
                      }
                    });
 
                    const displayValue = count > 0 ?
                      (col.aggType === 'avg' ? total / count : total) :
                      null;
 
                    return (
                      <td
                        key={`total-${idx}`}
                        className="border-2 border-gray-400 px-4 py-2 text-center font-medium  whitespace-nowrap"
                        style={{ width: '150px',backgroundColor: '#d4d4d4' }}
                        >
                        {displayValue !== null ? displayValue.toFixed(2) : ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
 
        <tfoot>
          <tr>
            <td
              className="border-2 border-gray-400 bg-color-red px-4 py-2 font-semibold text-center"
              colSpan={Math.max(rowLevels, 1)}
              style={{ width: '150px',backgroundColor: '#d4d4d4' }}
              >
              Grand Total
            </td>
            {colHeaders.map((col, idx) => {
              const match = col.match(/\((sum|avg|count|min|max)\)$/i);
              const aggType = match ? match[1].toLowerCase() : null;
              let total = '';
             
              if (aggType) {
                const values = [];
                for (const rowKey in tableData) {
                  if (tableData[rowKey][col] !== undefined) {
                    values.push(tableData[rowKey][col]);
                  }
                }
               
                if (values.length > 0) {
                  switch (aggType) {
                    case 'sum':
                    case 'count':
                      total = values.reduce((acc, val) => acc + val, 0).toFixed(2);
                      break;
                    case 'avg':
                      total = (values.reduce((acc, val) => acc + val, 0) / values.length).toFixed(2);
                      break;
                    case 'min':
                      total = Math.min(...values).toFixed(2);
                      break;
                    case 'max':
                      total = Math.max(...values).toFixed(2);
                      break;
                  }
                }
              }
             
              return (
                <td
                  key={`footer-${idx}`}
                  className="border-2 border-gray-400 px-4 py-2 text-center font-semibold bg-black-50"
                  style={{ width: '150px',backgroundColor: '#d4d4d4' }}
                >
                  {total}
                </td>
              );
            })}
           
            {/* Grand totals for the unique total columns */}
            {uniqueLeafColumns.map((col, idx) => {
              // Find all columns that match this baseName and aggType
              const matchingColumns = colHeaders.filter(c => {
                const parts = c.split(' → ');
                const lastPart = parts[parts.length - 1];
                return lastPart === `${col.displayName}`;
              });
 
              // Calculate combined grand total for all matching columns
              let total = 0;
              let count = 0;
              matchingColumns.forEach(matchCol => {
                for (const rowKey in tableData) {
                  const value = tableData[rowKey]?.[matchCol];
                  if (typeof value === 'number') {
                    total += value;
                    count++;
                  }
                }
              });
 
              const displayValue = count > 0 ?
                (col.aggType === 'avg' ? total / count : total) :
                null;
 
              return (
                <td
                  key={`footer-total-${idx}`}
                  className="border-2 border-gray-400 px-4 py-2 text-center font-semibold bg-gray-50"
                  style={{ width: '150px',backgroundColor: '#d4d4d4' }}
                >
                  {displayValue !== null ? displayValue.toFixed(2) : ''}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
 
export default PivotTable;
 