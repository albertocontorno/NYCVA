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
    traces = [];
    tracesGrouped = [];
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

        if(self.multiple){
            self.dataGrouped = d3.nest()
                .key(function(d) { return d[self.groupKey]; })
                .rollup(function(v) { 
                        console.log()
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

            console.log(self.dataGrouped);
            self.dataGrouped.forEach( (el, index) => {
                var trace = {
                    y: el['value'],
                    boxpoints: 'all',
                    showlegend: false,
                    type: 'box',
                    name: el['key'],
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
                    },
                    //marker: { color: 'purple' },
                };    
                self.traces.push(trace);
            });
            console.log(self.traces)
            var config = {responsive: true};
            Plotly.newPlot(self.graphDiv, self.traces, null, config);
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
            var config = {responsive: true};
            Plotly.newPlot(self.graphDiv, self.traces, null, config);
        }

        self.graphDiv.on('plotly_selected', function(eventData) {
            console.log(eventData);
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
            .rollup(function(v) { return v.map( k=> k[self.valueKey]); })
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
            el.values.forEach( v => {
                x.push(...new Array(v['value'].length).fill(v['key']));
                trace.y.push(...v['value'])
            });
            self.tracesGrouped.push(trace);
        });
        var layout = {
            yaxis: {
              zeroline: true
            },
            boxmode: 'group'
          };
        console.log(self.tracesGrouped);
        var config = {responsive: true};
        Plotly.newPlot(self.graphDivGrouped, self.tracesGrouped, layout, config);
    }

    takeSelectedPoints(){
        
    }

    update(){
        var selectedPoints = {};
        
        selectedPointsDataset.forEach( pt => {
            let k = this.data[pt][this.groupKey];
            if(!selectedPoints[k]) { selectedPoints[k] = []; }
            selectedPoints[k].push(this.realIndexToIndex[k][pt])
        });

        this.traces.forEach( trace => {
            trace.selectedpoints = selectedPoints[trace.name] || [];
        });
        
        Plotly.react(this.graphDiv, this.traces);
        //Plotly.restyle(this.graphDivGrouped, {selectedpoints: [selectedPoints]}, [0]);
    }
}