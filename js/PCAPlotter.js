class PCAPlotter {

    callback = null;
    data = [];
    adjustedData = [];

    constructor(data){
        this.data = data;
    }

    initPlotter() {
        var self = this;

        console.log("Preparing data for pca..");
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
        console.log(self.adjustedData);

        self.plotPCAScatterPlot(self.adjustedData, false, self.callback)

    }


    plotPCAScatterPlot(data, update, callback) {

        var PCADiv = document.getElementById('scatter_pca_container');
        var config = {responsive: true};

        if (update) {

            var colors = [];
            for(var i = 0; i < this.adjustedData.adjustedData[0].length; i++) colors.push('#1f77b4'); //Starting color

            data.points.forEach(function(pt) {
                colors[pt.pointIndex] = '#941a20'; // Select color
            });

            Plotly.restyle(PCADiv, 'marker.color', [colors], [0]);

        } else {
            var trace1 = {
                x: data.adjustedData[0],
                y: data.adjustedData[1],
                mode: 'markers',
                type: 'scatter'
            };

            var dataToPlot = [trace1];

            Plotly.newPlot(PCADiv, dataToPlot, null, config);

            PCADiv.on('plotly_selected', function(eventData) {
                if(!eventData) {eventData = {}; eventData.points = []}
                console.log(eventData.points);

                var colors = [];
                for(var i = 0; i < data.adjustedData[0].length; i++) colors.push('#1f77b4'); //Starting color

                eventData.points.forEach(function(pt) {
                    colors[pt.pointNumber] = '#941a20'; // Select color
                });

                Plotly.restyle(PCADiv, {selectedpoints: [null]}, [0]);
                Plotly.restyle(PCADiv, 'marker.color', [colors], [0]);

                callback(eventData);

            });
        }
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