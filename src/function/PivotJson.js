
function PivotJson(csvData, rowDimensions, columnDimensions, valueFields) {
/**
 * csvData = "department,region,sales\nIT,North,100\n,IT,south,200\n"
 * rowDimesions = [department]
 * columnDimesion = [region]
 * valueFields = [sales]
 */

  const [headerLine, ...lines] = csvData.trim().split('\n');
  // ["department, region, sales",
  // "IT,North,100", 
  // "IT, south,200"]
  const headers = headerLine.trim().split(',');
  // ["department", "region", "sales"]

  const selectedHeaders = [...rowDimensions, ...columnDimensions]; 
  // [department, region]

  const pivot = {}; 

  lines.forEach(line => {
    const values = line.trim().split(',');
    // values= [IT, north, 100]

    const row = {};

    headers.forEach((header, index) => {
      row[header] = isNaN(values[index]) ? values[index] : Number(values[index]); 
      /**
       * row = { department : IT , region: north, sales: 100} 
       */
    });

    let currentKey = pivot;

    // [department, region]
    selectedHeaders.forEach(header => {
      
      const obj = row[header];
      // obj = "IT"
      if (!currentKey[obj]) {
        currentKey[obj] = {};
        // pivot{IT :{}} ---I1
        // pivot{IT :{North :{}}} ---I2
      }
      currentKey = currentKey[obj]; 
    });
   
    // ["sales"]
    valueFields.forEach(field => {
      // 100
      const valData = row[field];
      
      if (!currentKey[field]) {
        currentKey[field] = {
          sum: 0,
          count: 0,
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY,
          avg: 0
        };
         /**
          *  pivot {IT :{North :{sum:0, count:0, min:-x, max:+x, avg:0}}}
          */
      }

      currentKey[field].sum += valData;
      currentKey[field].count += 1;
      currentKey[field].min = Math.min(currentKey[field].min, valData);
      currentKey[field].max = Math.max(currentKey[field].max, valData);
      currentKey[field].avg = parseFloat((currentKey[field].sum / currentKey[field].count).toFixed(2));

         /**
          *  pivot {IT :{North :{sum:100, count:1, min:100, max:100, avg:100}}}
          */
    });
  });

  return pivot;
}

export default PivotJson;