

(async() =>{
    const data = await(await fetch('/BatchTable (1).xlsx')).arrayBuffer();
    const workbook = XLSX.read(data);

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert the worksheet to a JSON object
let jsonData = XLSX.utils.sheet_to_json(worksheet);
//preprocessing to take care of missing values in the excel sheet
let listOfHeaders = jsonData.reduce((acc, row) => {
    Object.keys(row).forEach(key => {
        if (!acc.includes(key)) {
            acc.push(key);
        }
    });
    return acc;
}, []);

let jsonTransposed = jsonData.reduce((acc, row) => {
    listOfHeaders.forEach(key => {
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(row[key]);
    });
    return acc;
}, {});

let df = new dfd.DataFrame(jsonTransposed);

// Create an empty array
let noneArray = [];

// Fill the array with 878 null values

for (let i = 0; i < df.shape[0]; i++) {
    noneArray.push(null);
}



// Convert the array to a DataFrame
for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 2; j++) {
        df.addColumn(
             `STATION${i}_${j}_nb_bad`,
             df[`STATION${i}_c_total_blanks_seen_${j}`].sub(df[`STATION${i}_c_nb_good_${j}`]),
             { inplace: true }
        );
        df.addColumn( 
            `STATION${i}_${j}_pct_bad`,
            df[`STATION${i}_c_total_blanks_seen_${j}`]
                    .sub(df[`STATION${i}_c_nb_good_${j}`])
                    .mul(100)
                    .div((df[`STATION${i}_c_total_blanks_seen_${j}`].add(Array(df.shape[0]).fill(0.001)))),
                    { inplace: true }

        );
         df.addColumn(
            `STATION${i}_${j}_main_cause`,
            new Array(df.shape[0]).fill(0),
            { inplace: true }
       );
        
    }
}

for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= 2; j++) {
let columns_to_check = [
    `STATION${i}_c_nb_diameter_${j}`,
    `STATION${i}_c_nb_bigshape_${j}`,
    `STATION${i}_c_nb_shape_int_${j}`,
    `STATION${i}_c_nb_shape_ext_${j}`,
    `STATION${i}_c_nb_stain_${j}`,
    `STATION${i}_c_nb_surface_fixe_${j}`,
    `STATION${i}_c_nb_surface_adapt_${j}`,
    `STATION${i}_c_nb_rim_cont_${j}`,
    `STATION${i}_c_nb_rim_surf_${j}`,
    `STATION${i}_c_nb_color_general_${j}`,
    `STATION${i}_c_nb_colour_${j}`
];

for (let k= 0; k < df.shape[0]; k++) {
let maxColumnName = null;
let maxValue = -Infinity;

columns_to_check.forEach(columnName => {
    const value = df[columnName].values[k];
    if (value > maxValue) {
        maxValue = value;
        maxColumnName = columnName;
    }
    
});
 if (maxValue === 0) {
    maxColumnName = "STATION0_c_nb_None_0";
} 
df[`STATION${i}_${j}_main_cause`].values[k] = maxColumnName.slice(14, -2);
} } }












let fulllist = new dfd.Series([...(df["STATION1_1_main_cause"].values),...(df["STATION1_2_main_cause"].values),...(df["STATION2_1_main_cause"].values),...(df["STATION2_2_main_cause"].values)]);
//console.log(df["STATION1_1_main_cause"]);
//let ordered_columns =[...(df["STATION1_1_main_cause"].values),...(df["STATION1_2_main_cause"].values),...(df["STATION2_1_main_cause"].values),...(df["STATION2_2_main_cause"].values)].valueCounts().argSort({ ascending: false }).values;

let ordered_columns= fulllist.valueCounts().argSort({ ascending: false }).values;

let columns_to_check_sliced = [
    `diameter`,
    `bigshape`,
    `shape_int`,
    `shape_ext`,
    `stain`,
    `surface_fixe`,
    `surface_adapt`,
    `rim_cont`,
    `rim_surf`,
    `color_general`,
    `colour`
];

// Iterate through each item in the legend
columns_to_check_sliced.forEach(item => {
    // Check if the item is not already in the list
    if (!ordered_columns.includes(item)) {
        // If not, append it to the list
        ordered_columns.push(item);
    }
});

let Station1_1_pvalues = new Array(ordered_columns.length).fill(0) //values for the plot
let Station1_2_pvalues = new Array(ordered_columns.length).fill(0) //values for the plot
let Station2_1_pvalues = new Array(ordered_columns.length).fill(0) //values for the plot
let Station2_2_pvalues = new Array(ordered_columns.length).fill(0) //values for the plot

for (let k = 0; k < ordered_columns.length; k++) {
    Station1_1_pvalues[k] = df["STATION1_1_main_cause"].valueCounts().at(ordered_columns[k]);
}
for (let k = 0; k < ordered_columns.length; k++) {
    Station1_2_pvalues[k] = df["STATION1_2_main_cause"].valueCounts().at(ordered_columns[k]);
}
for (let k = 0; k < ordered_columns.length; k++) {
    Station2_1_pvalues[k] = df["STATION2_1_main_cause"].valueCounts().at(ordered_columns[k]);
}
for (let k = 0; k < ordered_columns.length; k++) {
    Station2_2_pvalues[k] = df["STATION2_2_main_cause"].valueCounts().at(ordered_columns[k]);
}





//plotting the data

// Get the DOM element where the chart will be rendered
var chartDom = document.getElementById('chart');

// Initialize ECharts instance
var myChart = echarts.init(chartDom);

// Specify chart configuration and data
var app = {};


var myChart = echarts.init(chartDom);
var option;

const posList = [
  'left',
  'right',
  'top',
  'bottom',
  'inside',
  'insideTop',
  'insideLeft',
  'insideRight',
  'insideBottom',
  'insideTopLeft',
  'insideTopRight',
  'insideBottomLeft',
  'insideBottomRight'
];
app.configParameters = {
  rotate: {
    min: -90,
    max: 90
  },
  align: {
    options: {
      left: 'left',
      center: 'center',
      right: 'right'
    }
  },
  verticalAlign: {
    options: {
      top: 'top',
      middle: 'middle',
      bottom: 'bottom'
    }
  },
  position: {
    options: posList.reduce(function (map, pos) {
      map[pos] = pos;
      return map;
    }, {})
  },
  distance: {
    min: 0,
    max: 100
  }
};
app.config = {
  rotate: 90,
  align: 'left',
  verticalAlign: 'middle',
  position: 'insideBottom',
  distance: 15,
  onChange: function () {
    const labelOption = {
      rotate: app.config.rotate,
      align: app.config.align,
      verticalAlign: app.config.verticalAlign,
      position: app.config.position,
      distance: app.config.distance
    };
    myChart.setOption({
      series: [
        {
          label: labelOption
        },
        {
          label: labelOption
        },
        {
          label: labelOption
        },
        {
          label: labelOption
        }
      ]
    });
  }
};
const labelOption = {
  show: true,
  position: app.config.position,
  distance: app.config.distance,
  align: app.config.align,
  verticalAlign: app.config.verticalAlign,
  rotate: app.config.rotate,
  formatter: '{c}  {name|{a}}',
  fontSize: 10,
  rich: {
    name: {}
  }
};

option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['STATION 1 1', 'STATION 1 2', 'STATION 2 1', 'STATION 2 2']
  },
  toolbox: {
    show: true,
    orient: 'vertical',
    left: 'right',
    top: 'center',
    feature: {
      mark: { show: true },
      dataView: { show: true, readOnly: false },
      magicType: { show: true, type: ['line', 'bar', 'stack'] },
      restore: { show: true },
      saveAsImage: { show: true }
    }
  },
  xAxis: [
    {
      type: 'category',
      axisTick: { show: false },
      data: ordered_columns,
      name: "Causes of Rejection" 
      
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: "Number of Batches Rejected",
    }
  ],
  series: [
    {
      name: 'STATION 1 1',
      type: 'bar',
      barGap: 0.2,
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: Station1_1_pvalues
    },
    {
      name: 'STATION 1 2',
      type: 'bar',
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: Station1_2_pvalues
    },
    {
      name: 'STATION 2 1',
      type: 'bar',
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: Station2_1_pvalues
    },
    {
      name: 'STATION 2 2',
      type: 'bar',
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: Station2_2_pvalues
    }
  ]
};

option && myChart.setOption(option);



})();