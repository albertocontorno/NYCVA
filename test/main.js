barChart_margin = {top: 20, right: 20, bottom: 30, left: 80};
const barChartSvg = d3.select("#barchart_avgPrizePerZone").append("g").attr("transform", "translate(" + barChart_margin.left + "," + barChart_margin.top + ")");

scatterPlot_margin = {top: 10, right: 30, bottom: 30, left: 60};
const scatterPlotSvg = d3.select("#location_scatter_plot").append("g").attr("transform", "translate(" + scatterPlot_margin.left + "," + scatterPlot_margin.top + ")");

d3.csv("./NYC_AirBnB_announcements_short.csv").then(function(data){
    console.log(data[0]);
    data = data.filter(d => d.price < 500);  //Remove outliers
    plotPricePerHoodChart(data);
    plotLocationScatterPlot(data);
    plotWordCloud(data);
    plotBoxplot(data);
    plotViolinplot(data);
    plotStackedplot(data);
});

d3.csv("./NYC_AirBnB_announcements_short_PCA.csv").then(function(data){
    data = data.filter(d => d.price < 500); //Remove outliers
    initAndPlotPCA(data);
});


function plotPricePerHoodChart(data) {
    data = data.sort( (a,b)=> a["price"] - b["price"]);

    const dataByHood = d3.nest()
        .key(function(d) { return d["neighbourhood_group"]; })
        .rollup(function(v) { return d3.mean(v, (el) => el["price"]) })
        .entries(data);

    dataByHood.sort( (a,b)=> b["value"] - a["value"]);

    createPricePerHoodChart(barChartSvg, dataByHood, data);

    window.onresize = createPricePerHoodChart.bind(null, barChartSvg, dataByHood);
}

function createPricePerHoodChart(el, dataByHood, data){
    let g = el;
    let width = +document.querySelector("#barchart_avgPrizePerZone").clientWidth - barChart_margin.left - barChart_margin.right;
    let height = +document.querySelector("#barchart_avgPrizePerZone").clientHeight - barChart_margin.top - barChart_margin.bottom;

    // Create scale
    const x_scale = d3.scaleLinear()
                  .domain([0, d3.max(dataByHood, (d)=>d["value"])])
                  .range([0, width]);

    // Add scales to axis
    const x_axis = d3.axisBottom().scale(x_scale);
    
    const y_scale = d3.scaleBand()
        .domain(dataByHood.map( el => el["key"]))
        .rangeRound([0, height]).paddingOuter(0.1).paddingInner(0.2);


    const y_axis = d3.axisLeft(y_scale);
    let barChart = new Barchart(dataByHood, width, height, x_axis, y_axis, x_scale, y_scale);
    barChart.dataValueAccessorFn = d => d["value"];
    barChart.dataLabelAccessorFn = d => d["value"];
    barChart.labelFn = d => "$" + Math.fround( d["value"]).toFixed(2);
    barChart.enableSelectionFn = (data_) => {
        var selection = data_.filter( v => v.selected ).map( v => v.key);
        if(selection.length <= 0){
            plotLocationScatterPlot( data, true )
        } else {
            var newData = data.filter( v => selection.includes(v.neighbourhood_group));
            plotLocationScatterPlot( newData, true )
        }


    };
    barChart.draw(g);
}


function unpack(rows, key) {
    return rows.map(function(row) {
        return row[key];
    });
}

function plotLocationScatterPlot(data, update = false) {
    
    const scl = [[0, "#440154"],
    [0.1111111111111111, "#482878"],
    [0.2222222222222222, "#3e4989"],
    [0.3333333333333333, "#31688e"],
    [0.4444444444444444, "#26828e"],
    [0.5555555555555556, "#1f9e89"],
    [0.6666666666666666, "#35b779"],
    [0.7777777777777778, "#6ece58"],
    [0.8888888888888888, "#b5de2b"],
    [1, "#fde725"]];

    var plotData = [
        {
            type: "scattermapbox",
            text: unpack(data, "name"),
            lon: unpack(data, "longitude"),
            lat: unpack(data, "latitude"),
            marker: {
                color: unpack(data, 'price'), 
                cmax: 500, 
                cmin: 0,
                colorscale: scl,
                reversescale: true,
                size: 6,
                showscale: true,
                colorbar:{
                    thickness: 15,
                    ticksuffix: ' $',
                    ticks: 'outside',
                    ticklen: 5,
                }
            },
            hoverlabel: {namelength: 0},
            hovertemplate: "<b>Price</b>: %{marker.color}  $ <br>%{text}"
        }
    ];

    var plotLayout = {
        dragmode: "zoom",
        mapbox: { style: "light", center: { lat: 40.70, lon: -73.95 }, zoom: 10 },
        margin: { r: 0, t: 0, b: 0, l: 0 },
    };

    var graphDiv = document.getElementById('scatter_map_container');
    if(update){
        var config = {responsive: true, mapboxAccessToken: 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiY2lxMnVvdm5iMDA4dnhsbTQ5aHJzcGs0MyJ9.X9o_rzNLNesDxdra4neC_A'};
        Plotly.react(graphDiv, plotData, plotLayout, config);
    } else {
        var config = {responsive: true, mapboxAccessToken: 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiY2lxMnVvdm5iMDA4dnhsbTQ5aHJzcGs0MyJ9.X9o_rzNLNesDxdra4neC_A'};
        Plotly.newPlot(graphDiv, plotData, plotLayout, config);
        graphDiv.on('plotly_selected', function(eventData) {
            console.log(eventData.points);
            console.log(data[eventData.points[0].pointIndex], eventData.points[0].pointIndex)
        });
    }
}

function plotWordCloud(data){
    const wordCloud = new WordCloud(data);
    wordCloud.plotWordCloud();
}

function initAndPlotPCA(data){
    const pca = new PCAPlotter(data);
    pca.callback = (updatedData) => {
        plotLocationScatterPlot(updatedData, true);
    };
    pca.initPlotter();
}

function plotBoxplot(data){
    const boxplot = new Boxplot(data, 'price', '', true, 'neighbourhood_group');
    boxplot.draw('boxplot');
    boxplot.drawGrouped('boxplot_grouped');
    document.getElementById('boxplot_grouped').classList.toggle('hide');
    document.getElementById('boxplot_btn').onclick = e => {
        document.getElementById('boxplot').classList.toggle('hide');
        document.getElementById('boxplot_grouped').classList.toggle('hide');
        if(document.getElementById('boxplot').classList.contains('hide')){
            document.getElementById('boxplot_btn').innerText = 'Grouped by neighbourhood';
            Plotly.Plots.resize(d3.select('#boxplot_grouped').node());
        } else {
            document.getElementById('boxplot_btn').innerText = 'Grouped by room type';
            Plotly.Plots.resize(d3.select('#boxplot').node());
        }
    };
}

function plotViolinplot(data){
    const violinplot = new Violinplot(data, 'price', '', true, 'neighbourhood_group');
    violinplot.draw('violionplot');
    violinplot.drawGrouped('violionplot_grouped');
    document.getElementById('violionplot_grouped').classList.toggle('hide');
    
    document.getElementById('violionplot_btn').onclick = e => {
        document.getElementById('violionplot').classList.toggle('hide');
        document.getElementById('violionplot_grouped').classList.toggle('hide');
        if(document.getElementById('violionplot').classList.contains('hide')){
            document.getElementById('violionplot_btn').innerText = 'Grouped by neighbourhood';
            Plotly.Plots.resize(d3.select('#violionplot_grouped').node());
        } else {
            document.getElementById('violionplot_btn').innerText = 'Grouped by room type';
            Plotly.Plots.resize(d3.select('#violionplot').node());
        }
    };
}

function plotStackedplot(data){
    var stackedplot = new StackedBarchart(data, 'price', '', 'neighbourhood_group', 'room_type');
    stackedplot.draw('room_types');
}