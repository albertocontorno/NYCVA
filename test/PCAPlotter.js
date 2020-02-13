class PCAPlotter {

    callback = null;
    data = [];

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
        var adData = PCA.computeAdjustedData(normalizedData,vectors[0], vectors[1]);
        console.log(adData);

        plotPCAScatterPlot(adData, self.callback)

    }
}



function plotPCAScatterPlot(data, callback) {

    var trace1 = {
        x: data.adjustedData[0],
        y: data.adjustedData[1],
        mode: 'markers',
        type: 'scatter'
    };

    var dataToPlot = [trace1];

    var PCADiv = document.getElementById('scatter_pca_container');
    Plotly.newPlot(PCADiv, dataToPlot);

    PCADiv.on('plotly_selected', function(eventData) {
        console.log(eventData.points);

        var allTheAnnouncements = [];
        d3.csv("./NYC_AirBnB_announcements_short.csv").then(function(data){
            allTheAnnouncements = data.filter(d => d.price < 500);

            var updatedData = [];
            eventData.points.forEach(v => {
                const point = allTheAnnouncements[v.pointIndex];
                if(point == null){
                    console.log("ERRORE NULL")
                } else {
                    updatedData.push(allTheAnnouncements[v.pointIndex])
                }

            });

            callback(updatedData)

        });

    });
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