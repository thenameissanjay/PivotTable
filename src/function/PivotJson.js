// Recursive function to sort JSON data
function sortJsonRecursively(data) {
  if (Array.isArray(data)) {
    // If the data is an array, recursively sort each item
    return data.map(item => sortJsonRecursively(item));
  } else if (typeof data === 'object' && data !== null) {
    // If the data is an object, recursively sort the keys and their values
    const sortedObject = {};
    Object.keys(data).sort().forEach(key => {
      sortedObject[key] = sortJsonRecursively(data[key]);
    });
    return sortedObject;
  }
  return data; // Return the value if it's neither an object nor an array
}
//  PivotJson function to convert CSV data into nested pivot format and return sorted output
function PivotJson(csvData, rowDimensions, columnDimensions, valueFields) {
  const [headerLine, ...lines] = csvData.trim().split('\n');
  const headers = headerLine.split(',');

  const selectedHeaders = [...rowDimensions, ...columnDimensions]; //  combine row & column headers
  const pivot = {}; //  pivot structure

  lines.forEach(line => {
    const values = line.split(',');
    const row = {};

    headers.forEach((header, index) => {
      row[header] = isNaN(values[index]) ? values[index] : Number(values[index]); //  convert numbers
    });

    let currentKey = pivot;

    selectedHeaders.forEach(header => {
      const obj = row[header];
      if (!currentKey[obj]) {
        currentKey[obj] = {}; // 🔄 create nested structure
      }
      currentKey = currentKey[obj]; // ⬇️ move deeper
    });

    valueFields.forEach(field => {
      const valData = row[field];

      if (!currentKey[field]) {
        currentKey[field] = {
          sum: 0,
          count: 0,
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY,
          avg: 0
        }; // 📈 init metrics
      }

      // ➕ update aggregation values
      currentKey[field].sum += valData;
      currentKey[field].count += 1;
      currentKey[field].min = Math.min(currentKey[field].min, valData);
      currentKey[field].max = Math.max(currentKey[field].max, valData);
      currentKey[field].avg = parseFloat((currentKey[field].sum / currentKey[field].count).toFixed(2));
    });
  });

  // 🧹 Sort pivot data alphabetically before returning
  const sortedPivot = sortJsonRecursively(pivot);

  return sortedPivot;
}

export default PivotJson;