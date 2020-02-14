class Violinplot{

    data = [];
    boxTitle = '';
    multiple = true;
    dataGrouped = [];
    groupKey = 'neighbourhood_group';
    groupSubKey = 'room_type'
    valueKey = 'name';

    constructor(data, valueKey, boxTitle, multiple, groupKey){
        this.data = data; //[{nameKey: 'we', data:[]}]
        this.boxTitle = boxTitle;
        this.valueKey = valueKey;
        this.multiple = multiple;
        this.groupKey = groupKey;
    }

    draw(domElement){
        const self = this;

        var traces = [];

        if(self.multiple){
            self.dataGrouped = d3.nest()
                .key(function(d) { return d[self.groupKey]; })
                .rollup(function(v) { return v.map( k=> k[self.valueKey]); })
                .entries(self.data);
    
            self.dataGrouped.forEach( (el, index) => {
                var trace = {
                    y: el['value'],
                    boxpoints: 'all',
                    showlegend: false,
                    type: 'violin',
                    name: el['key'],
                    box: {
                        visible: true
                      },
                };    
                traces.push(trace);
            });
            var config = {responsive: true}
            Plotly.newPlot(domElement, traces, null, config);
        } else {
            const self = this;
            var trace = {
                y: self.data[self.valueKey],
                type: 'box',
                name: self.data['key']
            };
            traces.push(trace);
            var config = {responsive: true}
            Plotly.newPlot(domElement, traces, null, config);
        }
 
    }

    drawGrouped(domElement){
        const self = this;
        self.dataGrouped = d3.nest()
        .key(function(d) { return d[self.groupSubKey]; })
                .key(function(d) { return d[self.groupKey]; })
                .rollup(function(v) { return v.map( k=> k[self.valueKey]); })
                .entries(self.data);
        
        var traces = [];

        self.dataGrouped.forEach( (el, index) => {
            let x = [];
            var trace = {
                x,
                y: [],
                boxpoints: 'all',
                showlegend: true,
                type: 'violin',
                name: el['key'],
                box: {
                    visible: true
                  },
            }
            el.values.forEach( v => {
                x.push(...new Array(v['value'].length).fill(v['key']));
                trace.y.push(...v['value'])
            });
            traces.push(trace);
        });
        var layout = {
            yaxis: {
              //title: 'normalized moisture',
              zeroline: true
            },
            boxmode: 'group',
            violinmode: 'group'
          };
        console.log(self.traces)
        var config = {responsive: true}
        Plotly.newPlot(domElement, traces, layout, config);
    }
}