class Barchart{

    barClass = '.bar';
    labelClass = '.bar_label';
    x_scale = null;
    y_scale = null;
    x_axis = null;
    y_axis = null;
    width = 200;
    height = 200;
    dataValueAccessorFn = null;
    dataLabelAccessorFn = null;
    barColor = 'steelblue';
    barColorHover = 'orange';
    yOffset = 35;
    xOffset = 1;
    barHeight = 30;
    fontSize = "14px";
    fontColor = "black";
    data = [];
    labelFn = null;
    enableSelection = true;
    enableSelectionFn = (data) => {}
    constructor(data, w, h, x_axis, y_axis, x_scale, y_scale ){
        this.data = data;
        this.width = w;
        this.height = h;
        this.x_axis = x_axis;
        this.y_axis = y_axis;
        this.x_scale = x_scale;
        this.y_scale = y_scale;
    }

    draw(g){
        const self = this; //because we need to use the normal function definition for D3 where this is not the class, but the D3 object

        g.text(""); //clear

        g.append("g")
            .attr("transform", "translate(0," + self.height + ")")
            .call(self.x_axis);
    
        g.append("g")
            .call(self.y_axis);
        
        let bars = g.selectAll(self.barClass)
            .data(self.data)
            .enter()
            .append("rect")
            .attr("fill", self.barColor)
            .attr("x", function (d, i) {
                return self.xOffset;
            })
            .attr("y", function (d, i) {
                return self.y_scale(d["key"]);
            })
            .attr("width", function(d) { return self.x_scale(self.dataValueAccessorFn ? self.dataValueAccessorFn(d) : d) })
            .attr("height", function(d) { return self.y_scale.bandwidth() })
            .on("mouseover", function(d, i){
                if(!d["selected"]){
                    d3.select(this).attr("fill", self.barColorHover)
                } else {
                    d3.select(this).attr("fill", 'green')
                }
            })
            .on("mouseleave", function(d, i){ 
                if(!d["selected"]){
                    d3.select(this).attr("fill", self.barColor)
                } else {
                    d3.select(this).attr("fill", 'green')
                }
            });


            if(self.enableSelection){
                bars.on('click', function(d, i){
                    if(!d["selected"]){
                        d["selected"] = true;
                        d3.select(this).attr("fill", 'green')
                    } else {
                        d["selected"] = false;
                        d3.select(this).attr("fill", self.barColorHover)
                    }                    
                    self.enableSelectionFn(self.data)
                });
                
            }
    
        g.selectAll(self.labelClass)
            .data(this.data)
            .enter()
            .append("text")
            .text( function (d) { return self.labelFn ? self.labelFn(d) : d })
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "end")
            .attr("font-size", self.fontSize)
            .attr("fill", self.fontColor)
            .attr("x", function(d) { return self.x_scale(d["value"]) - 5; })
            .attr("y", function(d, i) {return self.y_scale(d["key"]) + (self.y_scale.bandwidth() / 2) + 5});
    }
}
