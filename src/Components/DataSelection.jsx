import React, { useContext, useMemo, useEffect, useState } from "react";
import { CsvContext } from "../Context/Context";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

 
const DraggableHeader = ({ header, isNumeric, isSelected }) => {
  const [, drag] = useDrag(() => ({
    type: "header",
    item: { header },
  }));
 
  const selectedStyle = isSelected ? "bg-green-300" : "bg-gray-200 hover:bg-gray-300";
  const isDateHeader = header.includes("Date") || header.toLowerCase().includes("date");
  const emoji = isDateHeader ? "📅 " : "";
 
  return (
    <div
      ref={drag}
      className={`px-2 py-1 ${selectedStyle} rounded-full text-xs cursor-move flex items-center gap-1`}
    >
       {isNumeric && !isDateHeader && <span className="text-blue-500 font-bold">∑</span>}{emoji}{header}
    </div>
  );
};
 
const DropZone = ({ label, type, headers, onDrop, onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "header",
    drop: (item) => onDrop(type, item.header),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
 
  return (
    <div className="flex-1 flex flex-col">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{label}</h4>
      <div
        ref={drop}
        className={`h-[150px] overflow-y-auto p-2 border-2 border-dashed rounded-lg ${
          isOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <div className="flex flex-col gap-2">
          {headers.map((h) => (
            <span
              key={h}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex justify-between items-center"
            >
              {h}
              <button
                onClick={() => onRemove(type, h)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
 
const PivotSelector = ({ headers }) => {
  const {
    rows,
    setRows,
    columns,
    setColumns,
    measures,
    setMeasures,
    aggregation,
    setAggregation,
    selectedColumns,
    setSelectedColumns,
    csvText,
  } = useContext(CsvContext);
 
 
  const numericHeaders = useMemo(() => {
    if (!csvText) return [];
 
    const [headerLine, ...lines] = csvText.trim().split("\n");
    const headerArr = headerLine.trim().split(",");  // header
    const values = lines[0].trim().split(",")        // First Value
    if (!values) return [];
 
    return headerArr.filter((header, index) => {
      const value = values[index]
      return !isNaN(parseFloat(value)) && isFinite(value);
    });
  }, [csvText]);
 
  useEffect(() => {
    setRows((prev) => (prev.length === 0 ? [] : prev));
    setColumns((prev) => (prev.length === 0 ? [] : prev));
  }, []); 
 
 
  const handleDrop = (type, header) => {
    const isNumericHeader = numericHeaders.includes(header);
    const isDateHeader = header.toLowerCase().includes("date");
  
    if (type === "measure" && (!isNumericHeader || isDateHeader)) return;
    if ((type === "row" || type === "column") && isNumericHeader && !isDateHeader) return;
  
    setRows((prev) => prev.filter((h) => h !== header));
    setColumns((prev) => prev.filter((h) => h !== header));
    setMeasures((prev) => prev.filter((h) => h !== header));
  
    const updaterMap = {
      row: setRows,
      column: setColumns,
      measure: setMeasures,
    };
    const setState = updaterMap[type];
  
    setState((prev) => [...prev, header]);
    
    setSelectedColumns((prev) => {
      return Array.from(new Set([...prev, header]));
    });
  
    if (type === "measure") {
      setAggregation((prev) => ({
        ...prev,
        [header]: "sum",
      }));
    } 
  };
  
 
 
  const handleRemove = (type, header) => {
    const updaterMap = {
      row: [rows, setRows],
      column: [columns, setColumns],
      measure: [measures, setMeasures],
    };
    const [state, setter] = updaterMap[type];

    setter(state.filter((h) => h !== header));
    setSelectedColumns((prev) => prev.filter((col) => col !== header));
 
    if (type === "measure") {

      setAggregation((prev) => {
        const filtered = Object.entries(prev).filter(([key]) => key !== header);
        return Object.fromEntries(filtered);
      });
    }
  };
 
 
 
  return (
    <div>
    <DndProvider backend={HTML5Backend}>

    <div className="relative p-6 bg-white shadow-md rounded-lg max-w-6xl mx-auto mt-6 h-[90vh]">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Fields</h3>
        <div className="flex flex-col gap-y-2 max-h-[130px] overflow-y-auto border border-gray-300 p-2 rounded-lg">
          {headers.map((header) => (
            <div key={header} className="flex items-center justify-between gap-2">
              <DraggableHeader
                header={header}
                isNumeric={numericHeaders.includes(header)}
                isSelected={selectedColumns.includes(header)}
              />
            </div>
          ))}
        </div>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropZone
          label="Rows"
          type="row"
          headers={rows}
          onDrop={handleDrop}
          onRemove={handleRemove}
        />
        <DropZone
          label="Columns"
          type="column"
          headers={columns}
          onDrop={handleDrop}
          onRemove={handleRemove}
        />
      </div>
 
      {/* Measures + Aggregation in horizontal layout */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:gap-6 items-start">
        <div className="w-full md:w-1/2">
          <DropZone
            label="Measures"
            type="measure"
            headers={measures.filter(
              (h) => numericHeaders.includes(h) && !h.includes("date")
            )}
            onDrop={handleDrop}
            onRemove={handleRemove}
          />
        </div>
 
        <div className="flex-1 w-full md:w-1/2">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            Aggregation Type
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto border border-gray-300 p-2 rounded-lg">
            {measures
              .filter(
                (h) => numericHeaders.includes(h) && !h.includes("date")
              )
              .map((measure) => (
                <div key={measure} className="flex items-center gap-1 text-xs">
                  <span className="min-w-[50px] font-medium">{measure}</span>
                  <select
                    value={aggregation[measure] || "sum"}
                    onChange={(e) =>
                      setAggregation((prev) => ({
                        ...prev,
                        [measure]: e.target.value,
                      }))
                    }
                    className="flex-1 border min-w-[10px] border-gray-300 rounded-lg px-1 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-100 transition-all"
                  >
                    <option value="sum">Sum</option>
                    <option value="count">Count</option>
                    <option value="avg">Average</option>
                    <option value="max">Maximum</option>
                    <option value="min">Minimum</option>
                  </select>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
    </DndProvider>
    </div>
  );
};
 
 
export default PivotSelector;
 
 