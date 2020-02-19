class PCAPlotter {

    data = [];
    adjustedData = [];
    PCADiv;
    
    constructor(data){
        this.data = data;
        this.adjustedData[0] = [];
        this.adjustedData[1] = [];
        this.data.forEach( d => {
            this.adjustedData[0].push(d['x']);
            this.adjustedData[1].push(d['y']);
        });
    }

    initPlotter() {
        var self = this;
        //To create the precomputed pca file 
        //paste --delimiter=',' x.txt y.txt > xy.csv

        /* console.log("Preparing data for pca..");
        var pcaData = [];
        self.data.forEach(convertDataToArrayOfIntValues);

        function convertDataToArrayOfIntValues(value) {
            var string_arr = (Object.values(value));
            var numb_arr = [];
            string_arr.forEach(function (attr) {
                numb_arr.push(Number(attr));
            });
            pcaData.push(numb_arr)
        }

        var normalizedData = evaluateZScores(pcaData);

        console.log("Evaluating eigenvals and vecs");
        var vectors = PCA.getEigenVectors(normalizedData);
        console.log(vectors);

        console.log("Computing percentages");
        console.log("Top 1: " + PCA.computePercentageExplained(vectors,vectors[0]));
        console.log("Top 2: " + PCA.computePercentageExplained(vectors,vectors[0],vectors[1]));
        console.log("Top 3: " + PCA.computePercentageExplained(vectors,vectors[0],vectors[1],vectors[2]));

        console.log("Adjusting data");
        self.adjustedData = PCA.computeAdjustedData(normalizedData,vectors[0], vectors[1]); 
        console.log(self.adjustedData);*/

        self.plotPCAScatterPlot(self.adjustedData)

    }


    plotPCAScatterPlot(data) {

        this.PCADiv = document.getElementById('scatter_pca_container');
        var config = {responsive: true};

        var trace1 = {
            x: data[0],
            y: data[1],
            hoverinfo: 'skip',
            mode: 'markers',
            type: 'scatter',
            unselected: {
                marker: {
                    opacity: 1
                }
            }
        };

        var dataToPlot = [trace1];

        Plotly.newPlot(this.PCADiv, dataToPlot, null, config);

        this.PCADiv.on('plotly_selected', (eventData) => {
            if(!eventData) {eventData = {}; eventData.points = []}
            selectedPointsDataset.length = 0; //empty the array
            eventData.points.forEach(function(pt) {
                selectedPointsDataset.push(pt.pointNumber);
            });

            updateCharts();
        });
        
    }

    update(){
        var colors = [];
        for(var i = 0; i < this.adjustedData[0].length; i++) colors.push('#1f77b4'); //Starting color
    
        selectedPointsDataset.forEach(function(pt) {
            colors[pt] = '#941a20'; // Select color
        });

        Plotly.restyle(this.PCADiv, 'marker.color', [colors], [0]);
    }
}


function evaluateZScores(data) {
    var i;
    for (i = 0; i < 18; i++){
        var mu = evaluateMean(data, i);
        var sigma = evaluateStDev(data, i, mu);

        var j;
        for (j = 0; j < data.length; j++) {
            data[j][i] = (data[j][i] - mu) / sigma
        }
    }

    return data
}

function evaluateMean(data, i) {
    var total = 0;

    var j;
    for (j = 0; j < data.length; j++){
        total += data[j][i]
    }

    return total/data.length
}

function evaluateStDev(data, i, mean) {
    var valuesMinusMeanSquared = [];

    var j;
    for (j = 0; j < data.length; j++){
        valuesMinusMeanSquared.push((data[j][i] - mean) * (data[j][i] - mean))
    }
    var total = 0;
    for (j = 0; j < valuesMinusMeanSquared.length; j++){
        total += valuesMinusMeanSquared[j]
    }

    return Math.sqrt(total/valuesMinusMeanSquared.length)
}