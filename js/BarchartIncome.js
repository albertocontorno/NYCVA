class BarchartIncome {
    id;
    dataset = [];
    dataByHood = [];

    config = {responsive: true};

    margin = {
        l: 120,
        r: 20,
        b: 40,
        t:0
    };

    layout = {
        yaxis: {
            tickangle: 0,
            title: {
                text: 'Neighbourhood Group',
                font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            }
        },
        xaxis: {
            title: {
                text: 'Avg. monthly income ($)',
                font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            }
        },
        margin: this.margin,
        height: 268
    };
    
    constructor(id, data){
        this.id = id;
        this.dataset = data;
    }

    draw(domElement){
        const self = this; //because we need to use the normal function definition for D3 where this is not the class, but the D3 object

        self.dataByHood = d3.nest()
            .key(function(d) { return d["neighbourhood_group"]; })
            .rollup(function(v) { return d3.mean(v, (el) => el["monthlyincome"]) })
            .entries(self.dataset);

        self.dataByHood.sort( (a,b)=> b["value"] - a["value"]);

        self.graphDiv = document.getElementById('barchart_income_hood_group');

        var plotData = [
            {
                x: self.dataByHood.map( v => v.value ),
                y: self.dataByHood.map( v => v.key ),
                width: [0.5, 0.5, 0.5, 0.5, 0.5],
                text: self.dataByHood.map( v => parseFloat(v.value).toFixed(2) + ' $' ),
                textposition: 'outside',
                orientation: 'h',
                type: 'bar',
                hoverlabel: {namelength: 0},
                hovertemplate: "<b>Neighbourhood</b>: %{y}<br><b>Avg. monthly income</b>: %{text}",
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
            }
        ];

        Plotly.react(self.graphDiv, plotData, self.layout, self.config);

        self.graphDiv.on('plotly_selected', function(eventData) {
            if(!eventData) {eventData = {}; eventData.points = []}
            selectedPointsDataset.length = 0; //empty the array
            let selectedHoods = [];
            eventData.points.forEach(function(pt) {
                let hood = pt.y;
                selectedHoods.push(hood);
            });
            
            if(selectedHoods.length > 0){
                self.dataset.forEach( (v,i) => {
                    if(selectedHoods.includes(v.neighbourhood_group)){ selectedPointsDataset.push(i); }
                });
            } else {
                self.deselect();
            }

            updateCharts(self.id); 

        });
    }

    deselect(){
        var colors = [];
        for(var i = 0; i < this.dataByHood.length; i++) colors.push('#1f77b4'); //Starting color

        Plotly.restyle(this.graphDiv, {selectedpoints: [null]}, [0]);
        Plotly.restyle(this.graphDiv, 'marker.color', [colors], [0]);
    }    
}
