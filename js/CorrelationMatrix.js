class CorrelationMatrix{

    dataset = [];
    cols = [];
    colNames = [];
    correlation = [];
    graphDiv;

    constructor(data, cols, colNames){
        this.dataset = data;
        this.cols = cols;
        this.colNames = colNames;
    }

    draw(domElement){
        const self = this;
        self.graphDiv = document.getElementById(domElement);

        
        var corrData = [];
        for (var i = 0; i < dataset.length; i++){
            var obj = {index: i};
            self.cols.forEach(col => {
            obj[col] = parseFloat(dataset[i][col]);
            });
            corrData.push(obj);
        }

        var corr = jz.arr.correlationMatrix(corrData, self.cols);

        var z = [];
        var x = self.colNames; 
        var y = self.colNames;
        var lastKey = '';
        var currentRow = [];
        corr.forEach( el => {
            if(el['column_x'] != lastKey){
                lastKey = el['column_x'];
                currentRow = [];
                z.push(currentRow);
            } 
            currentRow.push(el['correlation'] == 1 ? 1 : el['correlation'].toFixed(3));
        });

        var plotData = [
            {
                z,
                x,
                y,
                transpose: true,
                type: 'heatmap',
                hoverongaps: true,
                colorscale:'Viridis',
                hovertemplate: '%{x} / %{y}<br><b>Correlation</b>: %{z}',
                hoverlabel: {namelength: 0},
                colorbar:{
                    title:{
                        text: 'Correlation',
                        side: 'bottom'
                    }
                }
            }
        ];

        var layout = {
            xaxis: {
                side: 'top'
            },
            annotations: [],
            margin:{
                l: 130,
                r: 0,
                t: 100
            }
        };
        
        for ( var i = 0; i < y.length; i++ ) {
            for ( var j = 0; j < x.length; j++ ) {
                var currentValue = z[i][j];
                if (currentValue > 0.11) {
                    var textColor = 'black';
                }else{
                    var textColor = 'white';
                }
                var result = {
                    xref: 'x1',
                    yref: 'y1',
                    x: x[j],
                    y: y[i],
                    text: z[i][j],
                    font: {
                        family: 'Courier New, monospace',
                        size: 12,
                        color: textColor
                    },
                    showarrow: false
                };
                layout.annotations.push(result);
            }
        }

        var config = {responsive: true};
        
        Plotly.newPlot(self.graphDiv, plotData, layout, config);
    }
}