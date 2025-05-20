import React, { useMemo, useContext, useState } from "react";
import Papa from "papaparse";
import { CsvContext } from "../Context/Context";


const CSVUploader = () => {
  const { csvText, setCsvText } = useContext(CsvContext);
  const [csvJson, setCsvJson] = useState([]);

  const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

  const handleFileUpload = (event) => {
  const file = event.target.files[0]; 
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const parsedData = results.data;
      // [
      //   { Region: "Asia", Year: 2023, Date: 11/12/2003 },
      //   { Region: "Europe", Year: 2024, Date: 11/2/2003 }
      // ]
      const dateColumns = Object.keys(parsedData[0] || {}).filter((key) =>
        isDate(parsedData[0][key])
      );

      const enrichedData = parsedData.map((row) => {
        const newRow = { ...row };
        dateColumns.forEach((col) => {
          if (isDate(row[col])) {
            const date = new Date(row[col]);
            newRow[`${col}_Year`] = date.getFullYear();
            newRow[`${col}_Month`] = date.toLocaleString("default", { month: "long" });
            newRow[`${col}_Day`] = date.toLocaleString("default", { weekday: "long" });
            newRow[`${col}_Quarter`] = `Q${Math.floor((date.getMonth() + 3) / 3)}`;
          }
          //  newRow =  { ...rows, Date_Year:2003, Date_Month: Feb, Date_Day: 14, Date_Quarter: 1}
        });
        return newRow;
      });

      setCsvJson(enrichedData); // parsed JSON
 //  csvjson =  [{ ...rows, Date_Year:2003, Date_Month: Feb, Date_Day: 14, Date_Quarter: 1},
 //             { ...rows, Date_Year:2003, Date_Month: May, Date_Day: 12, Date_Quarter: 2}]


      const unparsedCsv = Papa.unparse(enrichedData); 
      setCsvText(unparsedCsv); // unparsed CSV
    },
    error: (err) => {
      console.error("CSV parsing error:", err);
    },
  });
};



  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-2xl border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Upload CSV File</h2>

      <label className="block mb-6">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}   
          className=" w-full text-sm text-gray-500 mr-4 py-2 px-4 rounded-lg border-1 text-sm font-semibold bg-blue-50 "
          
        />
      </label>

 

      {csvJson &&  (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Parsed Table View:</h3>
          <div className="overflow-auto max-h-[400px] border border-gray-300 rounded-lg">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-blue-100 sticky top-0 z-10">
                <tr>
                  {/* { Region: "Asia", Year: 2023, Date: 11/12/2003 }-> [region, year, date].map() */}
                  {Object.keys(csvJson[0] || {}).map((key) => (
                    <th key={key} className="py-2 px-4 font-medium border border-gray-200">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
            {/* { Region: "Asia", Year: 2023, Date: 11/12/2003 }-> [Asia, 2003, 11/12/2003].map() */}

                {csvJson.map((row, rowIndex) => (
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
