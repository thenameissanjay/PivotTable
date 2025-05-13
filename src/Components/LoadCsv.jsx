import React, { useMemo, useContext, useState } from "react";
import Papa from "papaparse";
import { CsvContext } from "../Context/Context";
import Credits from "../function/Credits"
 
const CSVUploader = () => {
  const { csvText, setCsvText, userID, toggleReload } = useContext(CsvContext);
  const [loading, setLoading] = useState(false); // To handle loading state
  // Function to validate if the string matches the format YYYY-MM-DD
 
  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/; // Regex for YYYY-MM-DD format
    return regex.test(dateString);
  };
 
  const handleFileUpload = (e) => {
 
    Credits(userID, "read", "uploading the document");
    toggleReload();
    const file = e.target.files[0];
    if (!file) return;
 
    setLoading(true); // Start loading
 
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
 
      // Parse and enrich the CSV file after upload
      const { data } = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });
 
      if (!data || data.length === 0) return;
 
      const dateColumns = [];
 
      // Identify date columns
      Object.keys(data[0]).forEach((col) => {
        const sampleValue = data[0][col];
        if (isValidDate(sampleValue)) {
          dateColumns.push(col);
        }
      });
 
      // Function to calculate the ISO week number
      const getWeekNumber = (date) => {
        const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = tempDate.getUTCDay() || 7;
        tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
        return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
      };
 
      // Month and day names
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
 
      const dayNames = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
      ];
 
      // Enrich data with additional date-related columns
      const enrichedData = data.map((row) => {
        const newRow = { ...row };
        dateColumns.forEach((col) => {
          const date = new Date(row[col]);
          if (isValidDate(row[col])) {
            newRow[`${col}.Year`] = date.getFullYear();
            newRow[`${col}.MonthName`] = monthNames[date.getMonth()];
            newRow[`${col}.DayName`] = dayNames[date.getDay()];
            newRow[`${col}.Quarter`] = `Q${Math.floor((date.getMonth() + 3) / 3)}`;
            newRow[`${col}.WeekNumber`] = getWeekNumber(date);
          }
        });
        return newRow;
      });
 
      // Convert enriched data back to CSV format
      const enrichedCsvText = Papa.unparse(enrichedData);
      setCsvText(enrichedCsvText); // Update the context with the enriched CSV
 
      setLoading(false); // Stop loading after processing
    };
 
    reader.readAsText(file);
  };
 
  // Memoized parsed data to display in the table (no modification, just parsing)
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
            hover:file:bg-blue-100"
        />
      </label>
 
      {loading && (
        <div className="text-center text-blue-600 mb-4">Processing file...</div>
      )}
 
      {parsedData && !loading && (
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