function PivotJson(csvData, rowDimensions, columnDimensions, valueFields) {
  const [headerLine, ...lines] = csvData.trim().split('\n');
  // headerline ="product, category, month, region"

  const headers = headerLine.split(',');
  // headers = ['product', 'category', 'month', 'region']

  const selectedHeaders = [...rowDimensions, ...columnDimensions];
  // selectedHeaders = ['product', 'month', 'region']

  const pivot = {};

  lines.forEach(line => {
    const values = line.split(',');
    // values = ['Shoe', 'Footwear', 'June', 'North']

    const row = {};
    headers.forEach((header, index) => {
      row[header] = isNaN(values[index]) ? values[index] : Number(values[index]);
      // row['product'] = 'shoe',
      // row['Category'] = 'Footwear',
      // row['Month'] = 'June',
      // row['Region'] = 'North',

    });

    console.log('Row as array:', JSON.stringify(row, null, 2));
    // Row = { Product:'shoe' ,Category:'Footwear' ,Month:'June' ,Region: 'North'}

    let currentKey = pivot;

    selectedHeaders.forEach(header => {
      const obj = row[header];
      // Obj = Show -> Footwear -> June

      if (!currentKey[obj]) {
        currentKey[obj] = {};
      }
      currentKey = currentKey[obj];
      // currentKey =    Shoe{ 
      //                 Footwear {
      //                    June{ NULL }
      //                          }
      //                     }
    });
    


    valueFields.forEach(field => {
      const valData = row[field];
      // valData = '1000'
      // field = 'measures field'

      if (!currentKey[field]) {
        currentKey[field] = {
          sum: 0,
          count: 0,
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY,
          avg: 0
        };

      // currentKey =    Shoe{ 
      //                 Footwear {
      //                    June{ 
      //                          Measures{
      //                            sum:0,count:0,max:0,min:0,avg:0
      //                          }
      //                           }
      //                          }
      //                     }
      }
      currentKey[field].sum += valData;
      currentKey[field].count += 1;
      currentKey[field].min = Math.min(currentKey[field].min, valData);
      currentKey[field].max = Math.max(currentKey[field].max, valData);
      currentKey[field].avg = parseFloat((currentKey[field].sum / currentKey[field].count).toFixed(2));

      // currentKey =    Shoe{ 
      //                 Footwear {
      //                        June{ 
      //                          Measures{
      //                            sum:1000,count:1,max:1000,min:1000,avg:(1000/1)
      //                          }
      //                          }
      //                          }
      //                     }
    });
  });

  console.log('Final Pivot Data:', JSON.stringify(pivot, null, 2));  // 👈 pretty print the final pivot structure
  return pivot;
}

/* PivotData = {
  "Shoes": {
    "January": {
      "North": {
        "Sales": {
          "sum": 1500,
          "count": 1,
          "min": 1500,
          "max": 1500,
          "avg": 1500
        }
      },
      "South": {
        "Sales": {
          "sum": 2000,
          "count": 1,
          "min": 2000,
          "max": 2000,
          "avg": 2000
        }
      }
    },
    "February": {
      "North": {
        "Sales": {
          "sum": 1800,
          "count": 1,
          "min": 1800,
          "max": 1800,
          "avg": 1800
        }
      },
      "South": {
        "Sales": {
          "sum": 2500,
          "count": 1,
          "min": 2500,
          "max": 2500,
          "avg": 2500
        }
      }
    }
  }
     */




export default PivotJson;
