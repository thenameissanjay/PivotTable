
const MainContext = () => {
  
  // Function to extract headers from the first row of the CSV
const {csvText, setCsvText, rows, columns, measures,aggregation, selectedColumns } = useContext(CsvContext);
const headers = csvText ? csvText.trim().split('\n')[0].split(',').map(h => h.trim()) : [];
const PivotJson = selectedColumns? generatePivotjson(csvText, rows, columns, measures) : {};
useEffect(() => {
  console.log('PivotJson updated:', PivotJson);
}, [PivotJson]);

  return (
    <>
      <CSVUploader  />
      {csvText && (
        <PivotSelector headers={headers} />
      )}
      {PivotJson && (
        <PivotTable pivotData ={PivotJson}  aggregation ={aggregation} />
      )}

    </>
  );
};

export default MainContext;
