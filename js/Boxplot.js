class Boxplot{

    id;
    data = [];
    boxTitle = '';
    multiple = true;
    dataGrouped = [];
    groupKey = 'neighbourhood_group';
    groupSubKey = 'room_type';
    valueKey = 'name';
    graphDiv;
    graphDivGrouped;
    indexToRealIndex = {};
    realIndexToIndex = {};
    indexToRealIndexGrouped = {};
    realIndexToIndexGrouped = {};
    traces = [];
    tracesGrouped = [];
    boxPlotColors = [
        '#1f77b4',  //muted blue
        '#fc8d59',  //safety orange
        '#2ca02c',  //cooked asparagus green
        '#17becf',  //light blue
        '#9467bd'   //muted purple
    ];
    layout;
    layoutGrouped;
    constructor(id, data, valueKey, boxTitle, multiple, groupKey){
        this.id = id;
        this.data = data; //[{nameKey: 'we', data:[]}]
        this.boxTitle = boxTitle;
        this.valueKey = valueKey;
        this.multiple = multiple;
        this.groupKey = groupKey;
    }

    draw(domElement){
        const self = this;

        self.graphDiv = document.getElementById(domElement);
        self.traces = [];

        self.layout = {
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
                .rollup(function(v) { 
                        let key = v[0][self.groupKey];
                        self.indexToRealIndex[key] = {}; 
                        self.realIndexToIndex[key] = {};
                        return v.map( (k, i)=> {
                            let realIndex = self.data.findIndex( (v) => v===k );
                            self.indexToRealIndex[key][i] = realIndex;
                            self.realIndexToIndex[key][realIndex] = i;
                            return  k[self.valueKey];
                    });
                })
                .entries(self.data);

            self.dataGrouped.forEach( (el, index) => {
                var trace = {
                    y: el['value'],
                    boxpoints: 'all',
                    showlegend: false,
                    type: 'box',
                    name: el['key'],
                    marker: {
                        color: self.boxPlotColors[index]
                    },
                    selected: {
                        marker: {
                          color: '#941a20',
                          opacity: 1
                        }
                    },
                    unselected: {
                        marker: {
                          opacity: 1
                        }
                    }
                };    
                self.traces.push(trace);
            });

            Plotly.newPlot(self.graphDiv, self.traces, self.layout, config);
        } else {
            const self = this;
            var trace = {
                y: self.data[self.valueKey],
                type: 'box',
                name: self.data['key'],
                selected: {
                    marker: {
                      color: 'red',
                      opacity: 1
                    }
                },
                unselected: {
                    marker: {
                      opacity: 1
                    }
                }
            };
            self.traces.push(trace);
            Plotly.newPlot(self.graphDiv, self.traces, layout, config);
        }

        self.graphDiv.on('plotly_selected', function(eventData) {
            if(!eventData) {eventData = {}; eventData.points = []}
            selectedPointsDataset.length = 0; //empty the array
            
            eventData.points.forEach(function(pt) {
                let k = pt.data.name;
                selectedPointsDataset.push(self.indexToRealIndex[k][pt.pointIndex]);
            });
            updateCharts();
        });
 
    }

    drawGrouped(domElement){
        const self = this;

        self.graphDivGrouped = document.getElementById(domElement);

        self.dataGrouped = d3.nest()
            .key(function(d) { return d[self.groupSubKey]; })
            .key(function(d) { return d[self.groupKey]; })
            .rollup(function(v) { 
                let key = v[0][self.groupSubKey];
                if(!self.indexToRealIndexGrouped[key]) self.indexToRealIndexGrouped[key] = []; 
                if(!self.realIndexToIndexGrouped[key]) self.realIndexToIndexGrouped[key] = {};
                return v.map( (k, i)=> {
                    let realIndex = self.data.findIndex( (r) => r===k );
                    self.indexToRealIndexGrouped[key].push(realIndex);
                    self.realIndexToIndexGrouped[key][realIndex] = self.indexToRealIndexGrouped[key].length-1;
                    return  k[self.valueKey]; 
                });
            })
            .entries(self.data);
        
        self.tracesGrouped = [];

        self.dataGrouped.forEach( (el, index) => {
            let x = [];
            var trace = {
                x,
                y: [],
                boxpoints: 'all',
                showlegend: true,
                type: 'box',
                name: el['key'],
                marker: {
                    color: self.boxPlotColors[index]
                },
                selected: {
                    marker: {
                      color: '#941a20',
                      opacity: 1
                    }
                },
                unselected: {
                    marker: {
                      opacity: 1
                    }
                }
            };
            el.values.forEach( v => {
                x.push(...new Array(v['value'].length).fill(v['key']));
                trace.y.push(...v['value']);
            });
            self.tracesGrouped.push(trace);
        });
        self.layoutGrouped = {
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
            margin:{
                t:0
            }
          };
        var config = {responsive: true};
        Plotly.newPlot(self.graphDivGrouped, self.tracesGrouped, self.layoutGrouped, config);

        self.graphDivGrouped.on('plotly_selected', function(eventData) {
            if(!eventData) {eventData = {}; eventData.points = []}
            selectedPointsDataset.length = 0; //empty the array
            
            eventData.points.forEach(function(pt) {
                let k = pt.data.name;
                selectedPointsDataset.push(self.indexToRealIndexGrouped[k][pt.pointIndex]);
            });
            updateCharts();
        });
    }

    takeSelectedPoints(){
        
    }

    update(){
        var selectedPoints = {};
        var selectedPointsGrouped = {};

        selectedPointsDataset.forEach( pt => {
            let key;
            if(this.data[pt]){
                key = this.data[pt][this.groupKey]
            } else return;
            let keyGrouped = this.data[pt][this.groupSubKey];
            if(!selectedPoints[key]) { selectedPoints[key] = []; }
            selectedPoints[key].push(this.realIndexToIndex[key][pt]);
            if(!selectedPointsGrouped[keyGrouped]) { selectedPointsGrouped[keyGrouped] = []; }
            selectedPointsGrouped[keyGrouped].push(this.realIndexToIndexGrouped[keyGrouped][pt]);
        });

        this.traces.forEach( trace => {
            trace.selectedpoints = selectedPoints[trace.name] || [];
        });

        this.tracesGrouped.forEach( trace => {
            trace.selectedpoints = selectedPointsGrouped[trace.name] || [];
        });
        
        Plotly.react(this.graphDiv, this.traces, this.layout);
        Plotly.react(this.graphDivGrouped, this.tracesGrouped, this.layoutGrouped);
    }
}