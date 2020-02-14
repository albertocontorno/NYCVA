class Boxplot{

    data = [];
    boxTitle = '';
    multiple = true;
    dataGrouped = [];
    groupKey = 'neighbourhood_group';
    valueKey = 'name';
    traces = [];

    constructor(data, valueKey, boxTitle, multiple, groupKey){
        this.data = data; //[{nameKey: 'we', data:[]}]
        this.boxTitle = boxTitle;
        this.valueKey = valueKey;
        this.multiple = multiple;
        this.groupKey = groupKey;
        this.setupTraces();
    }

    setupTraces(){
        const self = this;

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
                    type: 'box',
                    name: el['key']
                };    
                self.traces.push(trace);
            });
            let layout = {

            };
            Plotly.newPlot('boxplot', this.traces);
        } else {
            const self = this;
            var trace = {
                y: self.data[self.valueKey],
                type: 'box',
                name: self.data['key']
            };
            self.traces.push(trace);
            Plotly.newPlot('boxplot', this.traces);
        }
 
    }

    draw(g){

    }
}