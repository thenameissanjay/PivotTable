import { createContext, useState } from "react";

export const CsvContext = createContext();

export const CsvProvider = ({ children }) => {
  const [csvText, setCsvText] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [measures, setMeasures] = useState([]);
  const [aggregation, setAggregation] = useState({}); // Change to object for per-measure aggregation
  const [selectedColumns, setSelectedColumns] =useState([]);
  const [pivotData, setPivotData] = useState([]);
  const [pivotJson, setPivotJson] = useState([]);
  const [dateColumns, setDateColumns] = useState([]);


  return (
    <CsvContext.Provider
      value={{
        csvText,
        setCsvText,
        headers,
        setHeaders,
        rows,
        setRows,
        columns,
        setColumns,
        measures,
        setMeasures,
       selectedColumns,
        setSelectedColumns, 
        pivotData, 
        setPivotData,
        aggregation,
        setAggregation,
        pivotJson,
        setPivotJson,
        dateColumns,
        setDateColumns
      }}
    >
      {children}
    </CsvContext.Provider>
  );
};
