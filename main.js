var dataByHood = [];
var svg = d3.select("svg"),
margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 80
};


var barChartSvg = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("./NYC_AirBnB_announcements.csv").then(function(data){
    let mean = d3.mean(data, (el) => el["price"]);
    data = data.sort( (a,b)=> a["price"] - b["price"]);
    console.log(data[0]);

    dataByHood = d3.nest()
        .key(function(d) { return d["neighbourhood_group"]; })
        .rollup(function(v) { return d3.mean(v, (el) => el["price"]) })
        .entries(data);

    createPricePerHoodChart(barChartSvg);
})


function createPricePerHoodChart(el){
    let g = el;
    width = +document.querySelector("svg").clientWidth - margin.left - margin.right;
    height = +document.querySelector("svg").clientHeight - margin.top - margin.bottom;

    
    dataByHood.sort( (a,b)=> b["value"] - a["value"]);
    // Create scale
    const x_scale = d3.scaleLinear()
                  .domain([0, d3.max(dataByHood, (d)=>d["value"])])
                  .range([0, width]);

    // Add scales to axis
    const x_axis = d3.axisBottom().scale(x_scale);
    
    const y_scale = d3.scaleBand()
        .domain(dataByHood.map( el => el["key"]))
        .range([0, 5])
        .rangeRound([0, height])
        .padding(0.1);

    var y_axis = d3.axisLeft(y_scale);

    let barChart = new Barchart(dataByHood, width, height, x_axis, y_axis, x_scale, y_scale);
    barChart.dataValueAccessorFn = d => d["value"]
    barChart.dataLabelAccessorFn = d => d["value"]
    barChart.labelFn = d => "$" + Math.fround( d["value"]).toFixed(2) 
    barChart.draw(g);
}


window.onresize = createPricePerHoodChart.bind(null, barChartSvg);





