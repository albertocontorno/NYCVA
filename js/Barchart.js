class Barchart{

    barClass = '.bar'
    x_scale = null
    y_scale = null
    x_axis = null
    y_axis = null
    width = 200
    height = 200
    dataValueAccessorFn = null
    dataLabelAccessorFn = null
    barColor = 'steelblue'
    barColorHover = 'orange'
    yOffset = 35
    xOffset = 1
    barHeight = 30
    fontSize = "14px"
    fontColor = "black"
    data = []
    labelFn = null

    constructor(data, w, h, x_axis, y_axis, x_scale, y_scale ){
        this.data = data
        this.width = w;
        this.height = h;
        this.x_axis = x_axis;
        this.y_axis = y_axis;
        this.x_scale = x_scale;
        this.y_scale = y_scale;
    }

    draw(g){
        const self = this //because we need to use the normal function defition for D3 where this is not the class, but the D3 object

        g.text("") //clear

        g.append("g")
            .attr("transform", "translate(0," + self.height + ")")
            .call(self.x_axis)
    
        g.append("g")
            .call(self.y_axis)
        
        g.selectAll(".bar")
            .data(self.data)
            .enter()
            .append("rect")
            .attr("fill", "steelblue")
            .attr("x", function (d, i) {
                return self.xOffset;
            })
            .attr("y", function (d, i) {
                return self.yOffset * i;
            })
            .attr("width", function(d) { return self.x_scale(self.dataValueAccessorFn ? self.dataValueAccessorFn(d) : d) })
            .attr("height", function(d) { return self.barHeight; })
            .on("mouseover", function(d, i){ 
                d3.select(this).attr("fill", self.barColor)
            })
            .on("mouseleave", function(d, i){ 
                d3.select(this).attr("fill", self.barColorHover)
            })
    
        g.selectAll(".text")
            .data(this.data)
            .enter()
            .append("text")
            .text( function (d) { return self.labelFn ? self.labelFn(d) : d })
            .attr("font-family", "sans-serif")
            .attr("font-size", self.fontSize)
            .attr("fill", self.fontColor)
            .attr("x", function(d) { return self.x_scale(d["value"]) - this.clientWidth - 5; })
            .attr("y", function(d, i) { return self.yOffset * i + 20 })
    }
}