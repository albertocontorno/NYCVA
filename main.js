
barChart_margin = {top: 20, right: 20, bottom: 30, left: 80};
const barChartSvg = d3.select("#barchart_avgPrizePerZone").append("g").attr("transform", "translate(" + barChart_margin.left + "," + barChart_margin.top + ")");

scatterPlot_margin = {top: 10, right: 30, bottom: 30, left: 60};
const scatterPlotSvg = d3.select("#location_scatter_plot").append("g").attr("transform", "translate(" + scatterPlot_margin.left + "," + scatterPlot_margin.top + ")");

var dataset;
var pcaDataset;

var selectedPointsDataset = [];
var chartsToUpdate = [];
var selectedPointsPca = [];

var pca;
var pricePerHoodBarchart, pricePerHoodSelectBarchart, boxplot;

const constants = {
    PRICE_PER_HOOD_BARCHART: 'PRICE_PER_HOOD_BARCHART',
    PRICE_PER_MICRO_HOOD_BARCHART: 'PRICE_PER_MICRO_HOOD_BARCHART',
    BOXPLOT_PRICE_DISTRIBUTIONS: 'BOXPLOT_PRICE_DISTRIBUTIONS'
};

Promise.all([d3.csv("./assets/NYC_AirBnB_announcements_short.csv"), d3.csv("./assets/NYC_AirBnB_announcements_short_PCA.csv")]).then( values => {

    var data = values[0];
    dataset = data.filter(d => d.price < 500);  //Remove outliers

    evaluateEstMonthlyIncome(dataset);
    console.log(dataset[0]);

    plotPricePerHoodChart(dataset);
    drawMap(dataset);
    createSearchSelectHoods(dataset);
    plotWordCloud(dataset);
    plotBoxplot(dataset);
    plotViolinplot(dataset);
    plotStackedplot(dataset);
    initAndPlotPCA(values[1]);
});

function plotPricePerHoodChart(data) {

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
    let barChart = new Barchart(constants.PRICE_PER_HOOD_BARCHART, dataByHood, width, height, x_axis, y_axis, x_scale, y_scale);
    pricePerHoodBarchart = barChart;
    barChart.dataValueAccessorFn = d => d["value"];
    barChart.dataLabelAccessorFn = d => d["value"];
    barChart.labelFn = d => "$" + Math.fround( d["value"]).toFixed(2);
    barChart.enableSelectionFn = (data_) => {
        var selection = data_.filter( v => v.selected ).map( v => v.key);
        selectedPointsDataset.length = 0; //empty the array
        dataset.forEach( (v,i) => {
            if(selection.includes(v.neighbourhood_group)){ selectedPointsDataset.push(i); }
        });
        updateCharts(barChart.id);
    };
    barChart.draw(g);
}


function unpack(rows, key) {
    return rows.map(function(row) {
        return row[key];
    });
}


function plotWordCloud(data){
    const wordCloud = new WordCloud(data);
    wordCloud.plotWordCloud();
}

function initAndPlotPCA(pcaData){
    pcaDataset = pcaData.filter(d => d.price < 500); //Remove outliers
    pca = new PCAPlotter(pcaDataset);
    pca.initPlotter();
}

function plotBoxplot(data){
    boxplot = new Boxplot(constants.BOXPLOT_PRICE_DISTRIBUTIONS, data, 'price', '', true, 'neighbourhood_group');
    chartsToUpdate.push(boxplot);
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

function evaluateEstMonthlyIncome(pcaDataset) {
    pcaDataset.forEach(getHouseMonthlyIncome);

    function getHouseMonthlyIncome(item, index) {
        pcaDataset[index].monthlyincome = (item.price * (365 - item.availability_365))/12;
    }
}

function drawMap(){
    const map = new MapChart(dataset);
    chartsToUpdate.push(map);
    map.draw('scatter_map_container');
}

function createSearchSelectHoods(dataset){
    pricePerHoodSelectBarchart = new BarchartSelect(constants.PRICE_PER_MICRO_HOOD_BARCHART, dataset);
    pricePerHoodSelectBarchart.draw();
        
}

function updateCharts(source = 'none'){
    chartsToUpdate.forEach(chart => {
        chart.update();
    });
    pca.update();
    if(source != constants.PRICE_PER_HOOD_BARCHART){
        pricePerHoodBarchart.deselect();
    }
    if(source != constants.PRICE_PER_MICRO_HOOD_BARCHART){
        pricePerHoodSelectBarchart.deselect();
    }
}