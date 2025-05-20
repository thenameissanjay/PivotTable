import './App.css'
import { CsvContext } from './Context/Context';
import { useContext, useEffect } from "react";
import CSVUploader from "./Components/LoadCsv";
import PivotSelector from "./Components/DataSelection";
import PivotJson from './function/PivotJson';
import PivotTable from './Components/PivotTable'

function App() {
  const {
    csvText,
    rows,
    columns,
    measures,
    aggregation,
    selectedColumns,
  } = useContext(CsvContext);

  const headers = csvText
  ? csvText.trim().split('\n')[0].split(',').map(h => h.trim())
  : [];


  const pivotJson = selectedColumns
    ? PivotJson(csvText, rows, columns, measures)
    : {};


  return (
    <div className="flex flex-row gap-4 p-4">
      <div className="w-8/10">
        {Object.keys(pivotJson).length === 0 ? (
          <CSVUploader />
        ) : (
          <PivotTable
            data={pivotJson}
            rowLevels={rows.length}
            aggregation={aggregation}
          />
        )}
      </div>

      <div className="w-2/10">
        {csvText && <PivotSelector headers={headers} />}
      </div>
    </div>
  );
}

export default App;
