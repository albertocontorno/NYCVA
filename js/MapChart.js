class MapChart{
    showIncome = false;
    layout;
    graphDiv;
    config = {responsive: true};
    dataset = [];
    color_scale;
    scl = [[0, "#440154"],
            [0.1111111111111111, "#482878"],
            [0.2222222222222222, "#3e4989"],
            [0.3333333333333333, "#31688e"],
            [0.4444444444444444, "#26828e"],
            [0.5555555555555556, "#1f9e89"],
            [0.6666666666666666, "#35b779"],
            [0.7777777777777778, "#6ece58"],
            [0.8888888888888888, "#b5de2b"],
            [1, "#fde725"]];
    
    constructor(data){
        this.dataset = data;
    }

    unpackColor(rows, key, color_scale){
        return rows.map( row => { return color_scale(row[key]) });
    }

    draw(domElement){
        const self = this;

        document.getElementById('map_btn').onclick = e => {
            document.getElementById('map_btn').classList.toggle('showIncome');
    
            if(document.getElementById('map_btn').classList.contains('showIncome')){
                document.getElementById('map_btn').innerText = 'Show encoding by price';
                self.showIncome = !self.showIncome;
                self.update();
            } else {
                document.getElementById('map_btn').innerText = 'Show encoding by monthly income';
                self.showIncome = !self.showIncome;
                self.update();
            }
        };
                
        let plotData = self.getPlotData();
    
        self.plotLayout = {
            dragmode: "zoom",
            mapbox: { style: "light", center: { lat: 40.70, lon: -73.95 }, zoom: 10 },
            margin: { r: 0, t: 0, b: 0, l: 0 },
        };


        self.graphDiv = document.getElementById(domElement);
        self.config = {responsive: true, mapboxAccessToken: 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiY2lxMnVvdm5iMDA4dnhsbTQ5aHJzcGs0MyJ9.X9o_rzNLNesDxdra4neC_A'};

        Plotly.newPlot(self.graphDiv, plotData, self.plotLayout, self.config);
        self.graphDiv.on('plotly_selected', function(eventData) {
            if(!eventData) {eventData = {}; eventData.points = []}
            selectedPointsDataset.length = 0; //empty the array
            eventData.points.forEach(function(pt) {
                selectedPointsDataset.push(pt.pointNumber);
            });
            updateCharts();
        });
    }

    update(){

        const self = this;

        let plotData = self.getPlotData();

        var colors = [];

        selectedPointsDataset.forEach(function(pt) {
            plotData[0].marker.color[pt] = '#941a20'; // Select color
        });

        Plotly.react(self.graphDiv, plotData, self.plotLayout, self.config);
    }

    getPlotData(){
        const self = this;
        let plotData;

        if (self.showIncome) {
            self.color_scale = d3.scaleQuantile().domain([0, 7500]).range(["#440154", "#482878", "#3e4989", "#31688e", "#26828e", "#1f9e89", "#35b779", "#6ece58", "#b5de2b", "#fde725"].reverse());
            plotData = [
                {
                    type: "scattermapbox",
                    text: unpack(self.dataset, "name"),
                    lon: unpack(self.dataset, "longitude"),
                    lat: unpack(self.dataset, "latitude"),
                    customdata: unpack(self.dataset, "monthlyincome"),
                    marker: { 
                        color: self.unpackColor(self.dataset, 'monthlyincome', self.color_scale),//unpack(dataset, 'price'),
                        cmax: 7500,
                        cmin: 0,
                        colorscale: self.scl,
                        reversescale: true,
                        size: 6,
                        showscale: true,
                        colorbar:{
                            thickness: 15,
                            ticksuffix: ' $',
                            ticks: 'outside',
                            ticklen: 5,
                            title:{
                                text: 'Income($)'
                            }
                        }
                    },
                    hoverlabel: {namelength: 0},
                    hovertemplate: "<b>Monthly income</b>: %{customdata}  $ <br>%{text}"
                }
            ];
        } else {
            self.color_scale = d3.scaleQuantile().domain([0, 500]).range(["#440154", "#482878", "#3e4989", "#31688e", "#26828e", "#1f9e89", "#35b779", "#6ece58", "#b5de2b", "#fde725"].reverse());

            plotData = [
                {
                    type: "scattermapbox",
                    text: unpack(self.dataset, "name"),
                    lon: unpack(self.dataset, "longitude"),
                    lat: unpack(self.dataset, "latitude"),
                    customdata: unpack(self.dataset, "price"),
                    marker: {
                        color: self.unpackColor(self.dataset, 'price', self.color_scale),//unpack(dataset, 'price'),
                        cmax: 500,
                        cmin: 0,
                        colorscale: self.scl,
                        reversescale: true,
                        size: 6,
                        showscale: true,
                        colorbar:{
                            thickness: 15,
                            ticksuffix: ' $',
                            ticks: 'outside',
                            ticklen: 5,
                            title:{
                                text: 'Price($)'
                            }
                        }
                    },
                    hoverlabel: {namelength: 0},
                    hovertemplate: "<b>Price</b>: %{customdata}  $ <br>%{text}"
                }
            ];
        }

        return plotData;
    }

}