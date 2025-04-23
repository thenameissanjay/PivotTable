import React, { useContext, useState, useMemo } from "react";
import { CsvContext } from "../Context/Context";
import { Plus } from "lucide-react"; // Lucide icon

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
    csvText
  } = useContext(CsvContext);

  const [popupType, setPopupType] = useState(null); // 'row', 'column', 'measure'

  const updaterMap = {
    row: [rows, setRows],
    column: [columns, setColumns],
    measure: [measures, setMeasures],
  };

  // Memoized numeric headers based on CSV content
  const numericHeaders = useMemo(() => {
    if (!csvText) return [];

    const [headerLine, ...lines] = csvText.trim().split("\n");
    const headerArr = headerLine.split(",");
    const firstDataLine = lines.find((line) => line.trim() !== "");
    if (!firstDataLine) return [];

    const values = firstDataLine.split(",");

    return headerArr.filter((header, index) => {
      const value = values[index];
      return !isNaN(parseFloat(value)) && isFinite(value);
    });
  }, [csvText]);

  const handleToggleHeader = (type, header) => {
    const [state, setter] = updaterMap[type];
    let updated;

    if (state.includes(header)) {
      updated = state.filter((item) => item !== header);
    } else {
      updated = [...state, header];
    }

    setter(updated);

    // Update selectedColumns globally
    const newSelected = new Set([
      ...(type === "row" ? updated : rows),
      ...(type === "column" ? updated : columns),
      ...(type === "measure" ? updated : measures),
    ]);
    setSelectedColumns(Array.from(newSelected));
  };

  const handleAggregationChange = (measure, newAggregation) => {
    setAggregation((prevAggregations) => ({
      ...prevAggregations,
      [measure]: newAggregation,
    }));
  };

  const renderSelectedTags = (label, type, state) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md font-semibold text-gray-700">{label}</h4>
        <button
          className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
          onClick={() => setPopupType(type)}
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {state.map((item) => (
          <span
            key={`${type}-${item}`}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );

  const renderPopup = () => {
    if (!popupType) return null;

    const [state] = updaterMap[popupType];

    // Determine which headers to show in the popup
    const availableHeaders =
      popupType === "measure"
        ? headers.filter((h) => numericHeaders.includes(h))
        : headers.filter((h) => !numericHeaders.includes(h));

    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4 capitalize">
            Select {popupType}s
          </h3>
          <div className="flex flex-wrap gap-2 mb-4 max-h-60 overflow-y-auto">
            {availableHeaders.map((header) => (
              <button
                key={`${popupType}-option-${header}`}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  state.includes(header)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleToggleHeader(popupType, header)}
              >
                {header}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => setPopupType(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative p-6 bg-white shadow-md rounded-lg max-w-6xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Pivot Table Configuration</h2>

      {/* Flex container for equal space distribution */}
      <div className="flex space-x-6 mb-6">
        <div className="flex-1">{renderSelectedTags("Rows", "row", rows)}</div>
        <div className="flex-1">{renderSelectedTags("Columns", "column", columns)}</div>
        <div className="flex-1">{renderSelectedTags("Measures", "measure", measures)}</div>

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Aggregation Type</h4>
          {measures.map((measure) => (
            <div key={measure} className="flex items-center mb-3">
              <span className="mr-2">{measure}</span>
              <select
  value={aggregation[measure] || ""}
  onChange={(e) => handleAggregationChange(measure, e.target.value)}
  className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-100 transition-all ease-in-out"
>
  <option value="" disabled>
    Select
  </option>
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

      <div className="mt-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Selected Columns</h4>
        <div className="flex flex-wrap gap-2">
          {selectedColumns.map((col) => (
            <span key={col} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              {col}
            </span>
          ))}
        </div>
      </div>

      {renderPopup()}
    </div>
  );
};

export default PivotSelector;
