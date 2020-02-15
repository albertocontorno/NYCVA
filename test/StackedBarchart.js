class StackedBarchart{

    groupSubKey;

    constructor(data, valueKey, boxTitle, groupKey, groupSubKey){
        this.data = data;
        this.boxTitle = boxTitle;
        this.valueKey = valueKey;
        this.groupKey = groupKey;
        this.groupSubKey = groupSubKey;
    }

    draw(domElement){
        const self = this;

        self.dataGrouped = d3.nest()
            .key(function(d) { return d[self.groupSubKey]; })
            .key(function(d) { return d[self.groupKey]; })
            .rollup(function(v) { return v.length })
            .entries(self.data);


        console.log(self.dataGrouped)
        var traces = []
        self.dataGrouped.forEach( hood => {
            var trace = {
                x: [], //una per ogni hood
                y: [],
                name: hood['key'],
                type: 'bar'
            }

            traces.push(trace);

            hood.values.forEach( roomType => {
                trace.x.push(roomType['key']);
                trace.y.push(roomType.value)
            })
        });
        console.log(traces)
      
        var layout = {barmode: 'stack'};
        var config = {responsive: true};
        Plotly.newPlot(domElement, traces, layout, config);
    }
}