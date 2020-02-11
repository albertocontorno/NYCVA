barChart_margin = {top: 20, right: 20, bottom: 30, left: 80};
const barChartSvg = d3.select("#barchart_avgPrizePerZone").append("g").attr("transform", "translate(" + barChart_margin.left + "," + barChart_margin.top + ")");

scatterPlot_margin = {top: 10, right: 30, bottom: 30, left: 60};
const scatterPlotSvg = d3.select("#location_scatter_plot").append("g").attr("transform", "translate(" + scatterPlot_margin.left + "," + scatterPlot_margin.top + ")");

d3.csv("./NYC_AirBnB_announcements.csv").then(function(data){

    plotPricePerHoodChart(data);
    //plotLocationScatterPlot(data);
    plotMapWithScatter(data)

});


function plotPricePerHoodChart(data) {
    data = data.sort( (a,b)=> a["price"] - b["price"]);
    console.log(data[0]);

    const dataByHood = d3.nest()
        .key(function(d) { return d["neighbourhood_group"]; })
        .rollup(function(v) { return d3.mean(v, (el) => el["price"]) })
        .entries(data);

    dataByHood.sort( (a,b)=> b["value"] - a["value"]);

    createPricePerHoodChart(barChartSvg, dataByHood);

    window.onresize = createPricePerHoodChart.bind(null, barChartSvg, dataByHood);
}

function createPricePerHoodChart(el, dataByHood){
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
        .rangeRound([0, height]).paddingOuter(0.1).paddingInner(0.2)


    const y_axis = d3.axisLeft(y_scale);

    let barChart = new Barchart(dataByHood, width, height, x_axis, y_axis, x_scale, y_scale);
    barChart.dataValueAccessorFn = d => d["value"];
    barChart.dataLabelAccessorFn = d => d["value"];
    barChart.labelFn = d => "$" + Math.fround( d["value"]).toFixed(2);
    barChart.draw(g);
}



function plotLocationScatterPlot(data) {

    scatterPlotSvg.append('svg:image')
        .attr('xlink:href', './New_York_City_.png')
        .attr("width", 800)
        .attr("height", 800)
        .attr("x", -15)
        .attr("y", -15);

    var latAndLong = data.map(function(d) {
        return {
            lat: d.latitude,
            lon: d.longitude
        }
    });

    let height = +document.querySelector("#location_scatter_plot").clientHeight - scatterPlot_margin.top - scatterPlot_margin.bottom;
    let width = +height;

    // Add X axis
    var x = d3.scaleLinear()
        .domain([d3.min(latAndLong, (d)=>+d.lon), d3.max(latAndLong, (d)=>+d.lon)])
        .range([ 0, width ]);
    scatterPlotSvg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([d3.min(latAndLong, (d)=>+d.lat), d3.max(latAndLong, (d)=>+d.lat)])
        .range([ height, 0]);
    scatterPlotSvg.append("g")
        .call(d3.axisLeft(y));

    // Add dots
    scatterPlotSvg.append('g')
        .selectAll("dot")
        .data(latAndLong)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(+d.lon); } )
        .attr("cy", function (d) { return y(+d.lat); } )
        .attr("r", 1.0)
        .style("fill", "#69b3a2");

}


function plotMapWithScatter(data){

    const svg = d3.select("#scatter_map").attr("preserveAspectRatio", "xMinYMin meet")
        .style("background","#c9e8fd")
        .classed("svg-content", true)

    const countriesGroup = svg.append("g").attr("id", "map")
    svg.call(dragBehavior);
    selectionRect.svg = countriesGroup;
    selectionRect.parent = countriesGroup;
    setPanAndZoom(svg, countriesGroup);

    const w = +document.querySelector("#scatter_map").clientWidth
    const h = +document.querySelector("#scatter_map").clientHeight
    //translate([this.getWidth() / 2, this.getHeight() / (2 * this.options.scaleHeight)]).scale(this.getWidth() / 640 * 100).rotate([-12, 0]).precision(0.1)
    const projection = d3.geoAlbersUsa()
    //translate([w/2, h/2]).scale(2000).center([-40, 40]);
    //translate([w / 2, h / (2 * 1)]).scale(w / 640 * 100).rotate([-12, 0]).precision(0.1)
    //translate([w/2, h/2]).scale(1000).center([-500,0]);
    var path = d3.geoPath().projection(projection);

    var worldmap = d3.json("./assets/new-york-city-boroughs.geojson");
    //d3.zoom().scaleExtent(this.options.scaleZoom).on('zoom', this.rescale.bind(this));

    Promise.all([worldmap]).then(function(values){   
        console.log(values) 
        projection.fitExtent([[20, 20], [w, h]], values[0])
        
    // draw map
    countriesGroup.selectAll("path")
        .data(values[0].features)
        .enter()
        .append("path")
        .attr("fill","lightgray")
        .attr("d", path)
        .on('mouseover', function(d, i){
            console.log("asdsadsadsa", d3.select(this))
            d3.select(this).attr("stroke", 'blue')
        })
        .on('mouseleave', function(d, i){
            console.log(d, d3.select(this))
            d3.select(this).attr("stroke", null)
        });
    // draw points
    var color_scale = d3.scaleLinear()
            .domain([d3.min(data, function(d){return +d.price}),  d3.max(data, function(d){return +d.price})])
            .range([0, 1]);
    var accent = d3.scaleOrdinal(d3.schemeAccent);
    selectionRect.scale = color_scale;
    selectionRect.accent = accent;
    countriesGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("fill", function(d){ return accent(color_scale(+d.price))})
    .attr("cx", function(d) {return projection([d.longitude, d.latitude])[0];})
    .attr("cy", function(d) {return projection([d.longitude, d.latitude])[1];})
    .attr("r", "1px")
    //add labels
        /*svg.selectAll("text")
            .data(values[1])
            .enter()
            .append("text")
            .text(function(d) {
                return d.id;
                })
            .attr("x", function(d) {return projection([d.longitude, d.latitude])[0] + 5;})
            .attr("y", function(d) {return projection([d.longitude, d.latitude])[1] + 15;})
            .attr("class","labels"); */
    });

    
}

function zoomed(svgTarget) {
    t = d3
       .event
       .transform;

    svgTarget.attr(
       "transform","translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
    );
 }

var panAndZoom = true;
function setPanAndZoom(svgEl, svgElTarget){
    if(panAndZoom){
        var zoom = d3
            .zoom()
            .on("zoom", zoomed.bind(null, svgElTarget));
        svgEl.call(zoom);
        console.log("zoom enabled")
    } else {
        svgEl.on(".zoom", null);
        console.log("zoom disabled")
    }
    
    //d3.select("#scatter_map")
}

function changePanAndZoom(btnEl){
    panAndZoom = !panAndZoom;
    btnEl.innerText = (panAndZoom ? 'Disable' : 'Enable') + ' Zoom';
    console.log(d3.select("#scatter_map"))
    setPanAndZoom(d3.select("#scatter_map"), d3.select("#map"))
}

var selectionRect = {
	element			: null,
	previousElement : null,
	currentY		: 0,
	currentX		: 0,
	originX			: 0,
    originY			: 0,
    svg             : null,
    parent          : null,
    scale           : null,
    accent          : null,
	setElement: function(ele) {
		this.previousElement = this.element;
		this.element = ele;
	},
	getNewAttributes: function() {
		var x = this.currentX<this.originX?this.currentX:this.originX;
		var y = this.currentY<this.originY?this.currentY:this.originY;
		var width = Math.abs(this.currentX - this.originX);
		var height = Math.abs(this.currentY - this.originY);
		return {
	        x       : x,
	        y       : y,
	        width  	: width,
	        height  : height
		};
	},
	getCurrentAttributes: function() {
		// use plus sign to convert string into number
		var x = +this.element.attr("x");
		var y = +this.element.attr("y");
		var width = +this.element.attr("width");
		var height = +this.element.attr("height");
		return {
			x1  : x,
	        y1	: y,
	        x2  : x + width,
            y2  : y + height,
            accent: this.accent,
            scale: this.scale
		};
	},
	getCurrentAttributesAsText: function() {
		var attrs = this.getCurrentAttributes();
		return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
	},
	init: function(newX, newY) {
        var rectElement = this.svg.append("rect");
        rectElement.attr('rx', 4)
        rectElement.attr('ry', 4)
        rectElement.attr('x', 0)
        rectElement.attr('y', 0)
        rectElement.attr('width', 0)
        rectElement.attr('height', 0)
        rectElement.classed("selection", true);
	    this.setElement(rectElement);
		this.originX = newX;
		this.originY = newY;
		this.update(newX, newY);
	},
	update: function(newX, newY) {
		this.currentX = newX;
        this.currentY = newY;
        const newAttr = this.getNewAttributes()
        this.element.attr('x', newAttr.x)
        this.element.attr('y', newAttr.y)
        this.element.attr('width', newAttr.width)
        this.element.attr('height', newAttr.height)
	},
	focus: function() {
        this.element
            .style("stroke", "#DE695B")
            .style("stroke-width", "2.5");
    },
    remove: function() {
    	this.element.remove();
    	this.element = null;
    },
    removePrevious: function() {
    	if(this.previousElement) {
    		this.previousElement.remove();
    	}
    }
};

function dragStart() {
	console.log("dragStart");
    var p = d3.mouse(this);
    selectionRect.init(p[0], p[1]);
	selectionRect.removePrevious();
}

function dragMove() {
	console.log("dragMove");
	var p = d3.mouse(this);
    selectionRect.update(p[0], p[1]);
}

function dragEnd() {
	console.log("dragEnd");
	var finalAttributes = selectionRect.getCurrentAttributes();
	console.dir(finalAttributes);
	if(finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1){
		console.log("range selected");
		// range selected
        d3.event.sourceEvent.preventDefault();
        selectionRect.parent.selectAll('circle').each(function(d,i) { 
            const circle = d3.select(this)
            if(circle.attr('cx') > finalAttributes.x1 && circle.attr('cx') < finalAttributes.x2 && circle.attr('cy') > finalAttributes.y1 && circle.attr('cy') < finalAttributes.y2){
                circle.attr('fill', 'green')
            } else {
                circle.attr('fill', finalAttributes.accent(finalAttributes.scale(+d.price)))
                //circle.attr('fill', 'transparent')
            }
        });
        
        selectionRect.remove()
		//selectionRect.focus();
	} else {
		console.log("single point");
        // single point selected
        selectionRect.remove();
        // trigger click event manually
    }
}

var dragBehavior = d3.drag()
    .on("drag", dragMove)
    .on("start", dragStart)
    .on("end", dragEnd);
