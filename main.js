var dataByHood = []
var svg = d3.select("svg"),
margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 80
}
width = +document.querySelector("svg").clientWidth - margin.left - margin.right
console.log(width )
height = +document.querySelector("svg").clientHeight - margin.top - margin.bottom
g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("./AB_NYC_2019.csv").then(function(data){
    let mean = d3.mean(data, (el) => el["price"])
    data = data.sort( (a,b)=> a["price"] - b["price"])
    console.log(data[0])

    dataByHood = d3.nest()
        .key(function(d) { return d["neighbourhood_group"]; })
        .rollup(function(v) { return d3.mean(v, (el) => el["price"]) })
        .entries(data);

    createPricePerHoodChart()
})


function createPricePerHoodChart(){
    width = +document.querySelector("svg").clientWidth - margin.left - margin.right
    console.log(width )
    height = +document.querySelector("svg").clientHeight - margin.top - margin.bottom

    dataByHood.sort( (a,b)=> b["value"] - a["value"])
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

    var y_axis = d3.axisLeft(y_scale)
    
    g.text("") //clear

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis)

    g.append("g")
        .call(y_axis)
    
    g.selectAll(".bar")
        .data(dataByHood)
        .enter()
        .append("rect")
        .attr("fill", "steelblue")
        .attr("x", function (d, i) {
            return 1;
        })
        .attr("y", function (d, i) {
            return 35 * i;
        })
        .attr("width", function(d) { return x_scale(d["value"]) })
        .attr("height", function(d) { return 30; })
        .on("mouseover", function(d, i){ 
            d3.select(this).attr("fill", "orange")
        })
        .on("mouseleave", function(d, i){ 
            d3.select(this).attr("fill", "steelblue")
        })

    g.selectAll(".text")
        .data(dataByHood)
        .enter()
        .append("text")
        .attr("x", function(d) { return  x_scale(d["value"]) - 55; })
        .attr("y", function(d, i) { return 35 * i + 20 })
        .text( function (d) { return "$" + Math.fround(d["value"]).toFixed(2) })
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("fill", "black")
}


window.onresize = createPricePerHoodChart





