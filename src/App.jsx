
import './App.css'
import { CsvContext } from './Context/Context';
import { useState,useContext, useEffect } from "react";
import CSVUploader from "./Components/LoadCsv";
import PivotSelector from "./Components/DataSelection";
import PivotJson from './function/PivotJson';
import PivotTable from './Components/PivotTable'

function App() {

const {csvText, setCsvText, rows, columns, measures,aggregation, selectedColumns } = useContext(CsvContext);
// csvText -> Upload Csv File
// headers -> csvText[0] = [Product, region, month, category, measures]
const headers = csvText ? csvText.trim().split('\n')[0].split(',').map(h => h.trim()) : [];
// select rows, column, measures <- header
// PivotJson(csvText, selected columns)
const pivotJson = selectedColumns? PivotJson(csvText, rows, columns, measures) : {};


useEffect(() => {
  console.log('PivotJson updated:', pivotJson);
  console.log(JSON.stringify(pivotJson, null, 2));

}, [pivotJson]);

  return (
    <>
    
      <CSVUploader  />

      {csvText &&   ( <PivotSelector headers={headers} />)}
      
      {pivotJson && ( <PivotTable data={pivotJson} rowLevels={rows.length} aggregation={aggregation} />)}

    </>
  )
}

export default App;
