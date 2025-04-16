const PivotData = {
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
  };
  
  // Arrays to store values
  const rowValuesMap = []; // For storing values for each row level (Region, Sales)
  const columnValuesMap = []; // For storing values for each column level (Month)
  
  const rowHeaders = extractRowHeadersWithRowspan(PivotData, 2);
  console.log("Row Headers:", rowHeaders);
  
  const columnData = extractColumnHeadersWithColspan(PivotData, 2, 4);
  console.log("Column Headers:", columnData.columnHeaders);
  console.log("Values:", columnData.values);
  
  function extractRowHeadersWithRowspan(data, rowDepth = 2) {
    const rowMap = Array.from({ length: rowDepth }, () => new Map());
  
    function traverse(node, level = 0) {
      if (level >= rowDepth || typeof node !== 'object') return;
  
      Object.entries(node).forEach(([key, value]) => {
        const currentMap = rowMap[level];
        currentMap.set(key, (currentMap.get(key) || 0) + countLeafNodes(value, level + 1));
        traverse(value, level + 1);
      });
    }
  
    function countLeafNodes(node, level) {
      if (level >= rowDepth || typeof node !== 'object') return 1;
      return Object.values(node).reduce((sum, val) => sum + countLeafNodes(val, level + 1), 0);
    }
  
    traverse(data);
  
    return rowMap.map((levelMap) => {
      return Array.from(levelMap.entries()).map(([value, rowspan]) => ({
        value,
        rowspan
      }));
    });
  }
  
  function extractColumnHeadersWithColspan(data, startDepth = 0, maxDepth = 3) {
    const levelMaps = Array.from({ length: maxDepth }, () => []);
    const values = Array.from({ length: maxDepth }, () => []);
  
    function traverse(node, level = 0) {
      if (typeof node !== 'object' || node === null || level >= startDepth + maxDepth) {
        return 1; // End of path
      }
  
      const entries = Object.entries(node);
      let totalColspan = 0;
  
      for (const [key, value] of entries) {
        const childColspan = traverse(value, level + 1);
        totalColspan += childColspan;
  
        if (level === startDepth) {
          // For the first level (regions), set colspan to 1
          levelMaps[0].push({ value: key, colspan: 1 });
          // Storing numeric values for level 0 (region sales data)
          if (value && typeof value === 'object') {
            const salesData = Object.values(value).map(monthData => {
              if (monthData && monthData.Sales) {
                return monthData.Sales.sum;
              }
              return 0; // Default to 0 if Sales data is not available
            });
            values[0].push(...salesData);
          }
        } else if (level === startDepth + 1 && key === 'Sales') {
          // For the second level (Sales), add it once with colspan of 4
          if (!levelMaps[1].some(header => header.value === 'Sales')) {
            levelMaps[1].push({ value: 'Sales', colspan: 4 });
            // Storing numeric values for level 1 (Sales)
            if (value && typeof value === 'object') {
              const salesData = Object.entries(value).map(([month, sales]) => {
                if (sales && sales.Sales) {
                  return sales.Sales.sum;
                }
                return 0; // Default to 0 if Sales data is not available
              });
              values[1].push(...salesData);
            }
          }
        }
      }
  
      return totalColspan;
    }
  
    traverse(data, 0);
  
    return {
      columnHeaders: levelMaps,
      values: values
    };
  }
  
  
  