class Violinplot{

    data = [];
    boxTitle = '';
    multiple = true;
    dataGrouped = [];
    groupKey = 'neighbourhood_group';
    groupSubKey = 'room_type';
    valueKey = 'name';
    boxPlotColors = [
        '#1f77b4',  //muted blue
        '#fc8d59',  //safety orange
        '#2ca02c',  //cooked asparagus green
        '#17becf',  //light blue
        '#9467bd'   //muted purple
    ];
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

        var layout = {
            yaxis: {
                title: {
                    text: 'Price ($)',
                    font: {
                        family: 'Courier New, monospace',
                        size: 18,
                        color: '#7f7f7f'
                    }
                }
            },
            xaxis: {
                title: {
                    text: 'Neighbourhood group',
                    standoff: 5,
                    font: {
                        family: 'Courier New, monospace',
                        size: 18,
                        color: '#7f7f7f'
                    }
                }
            },
            margin:{
                t:0
            }
        };

        var config = {responsive: true};

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
                    marker: {
                        color: self.boxPlotColors[index]
                    },
                    box: {
                        visible: true
                      },
                };    
                traces.push(trace);
            });
            Plotly.newPlot(domElement, traces, layout, config);
        } else {
            const self = this;
            var trace = {
                y: self.data[self.valueKey],
                type: 'box',
                name: self.data['key']
            };
            traces.push(trace);
            Plotly.newPlot(domElement, traces, layout, config);
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
                marker: {
                    color: self.boxPlotColors[index]
                },
                box: {
                    visible: true
                  },
            };
            el.values.forEach( v => {
                x.push(...new Array(v['value'].length).fill(v['key']));
                trace.y.push(...v['value'])
            });
            traces.push(trace);
        });
        var layout = {
            yaxis: {
                title: {
                    text: 'Price ($)',
                    font: {
                        family: 'Courier New, monospace',
                        size: 18,
                        color: '#7f7f7f'
                    }
                }
            },
            xaxis: {
                title: {
                    text: 'Neighbourhood group',
                    standoff: 5,
                    font: {
                        family: 'Courier New, monospace',
                        size: 18,
                        color: '#7f7f7f'
                    }
                }
            },
            boxmode: 'group',
            violinmode: 'group',
            margin:{
                t:0
            }
          };
        console.log(self.traces);
        var config = {responsive: true};
        Plotly.newPlot(domElement, traces, layout, config);
    }
}