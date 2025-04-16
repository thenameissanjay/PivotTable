import React, { useMemo, useContext } from "react";
import Papa from "papaparse";
import { CsvContext } from "../Context/Context";
const CSVUploader = () => {

    const {csvText, setCsvText} = useContext(CsvContext);
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvText(text); // Keep csvText as is
    };

    reader.readAsText(file);
  };

  // ✅ Parse csvText into JSON using PapaParse
  const parsedData = useMemo(() => {
    if (!csvText) return null;
    const { data } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    return data;
  }, [csvText]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-2xl border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">📁 Upload CSV File</h2>
      
      <label className="block mb-6">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "
        />
      </label>

      {/* 👇 Show parsed table only */}
      {parsedData && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🧾 Parsed Table View:</h3>
          <div className="overflow-auto max-h-[400px] border border-gray-300 rounded-lg">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-blue-100 sticky top-0 z-10">
                <tr>
                  {Object.keys(parsedData[0] || {}).map((key) => (
                    <th key={key} className="py-2 px-4 font-medium border border-gray-200">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="even:bg-gray-50">
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex} className="py-2 px-4 border border-gray-200">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
