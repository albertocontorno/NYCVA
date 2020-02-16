function createSearchSelectHoods(data){
    let select = $('#hoods_select');

    let hoods = d3.nest()
        .key(function(d) { return d['neighbourhood_group']; })
        .key(function(d) { return d['neighbourhood']; })
        .entries(data)

    hoods.forEach( group => {
        let groupElement = $(`<optgroup label="${group.key}"></optgroup>`);
        select.append(groupElement);
        group.values.forEach( hood => {
            let optionElement = $(`<option></option>`).attr('value', hood.key).text(hood.key);
            groupElement.append(optionElement);
        });
    });

    const margin = {
        l: 120,
        r: 40,
        b: 35,
        t: 15,
        pad: 4
    };

    const layout = {
        yaxis: {
          tickangle: -30
        },
        margin
      };
    const config = {responsive: true};

    var dataByHood = d3.nest()
                .key(function(d) { return d['neighbourhood'] } )
                .rollup(function(v) { return d3.mean(v, (el) => el["price"]) })
                .entries(data);
                
    console.log(dataByHood)
    dataByHood.sort( (a,b)=> b["value"] - a["value"]);

    $(document).ready(function() {
        select.select2({ width: '100%' });
        select.on('change.select2', e => {
            var selectedHoods = select.select2('data').map( v => v.id );
            dataByHoodFiltered = dataByHood.filter( v => selectedHoods.includes(v.key));
            var plotData = [
                {
                  x: dataByHoodFiltered.map( v => v.value ),
                  y: dataByHoodFiltered.map( v => v.key ),
                  text: dataByHoodFiltered.map( v => parseFloat(v.value).toFixed(2) + ' $' ),
                  hoverinfo: 'none',
                  textposition: 'outside',
                  orientation: 'h',
                  type: 'bar',
                  marker: {
                    size: 0.2,
                    line: {
                        color: 'blue',
                        width: 1
                    }
                  }
                },
            ];

            Plotly.react('price_hood_selected', plotData, layout, config);
        });
        selectTop5(select, dataByHood);
        $('#price_hood_top5').click(selectTop5.bind(null, select, dataByHood));
    });
}

function selectTop5(select, dataByHood){
    const top5 = dataByHood.slice(0, 5).map(v => v.key);
    console.log("TOP5", top5)
    select.val(null);
    select.val(top5).trigger('change');
}


function plotLocationScatterPlot(data, update = false) {

    const color_scale = d3.scaleQuantile().domain([0, 500]).range(["#440154", "#482878", "#3e4989", "#31688e", "#26828e", "#1f9e89", "#35b779", "#6ece58", "#b5de2b", "#fde725"].reverse());

    function unpackColor(rows, key){
        return rows.map(function(row) {
            return color_scale((row[key]));
        });
    }

    const scl = [[0, "#440154"],
    [0.1111111111111111, "#482878"],
    [0.2222222222222222, "#3e4989"],
    [0.3333333333333333, "#31688e"],
    [0.4444444444444444, "#26828e"],
    [0.5555555555555556, "#1f9e89"],
    [0.6666666666666666, "#35b779"],
    [0.7777777777777778, "#6ece58"],
    [0.8888888888888888, "#b5de2b"],
    [1, "#fde725"]];

    var plotData = [
        {
            type: "scattermapbox",
            text: unpack(dataset, "name"),
            lon: unpack(dataset, "longitude"),
            lat: unpack(dataset, "latitude"),
            customdata: unpack(dataset, "price"),
            marker: {
                color: unpackColor(dataset, 'price'),//unpack(dataset, 'price'), 
                cmax: 500, 
                cmin: 0,
                colorscale: scl,
                reversescale: true,
                size: 6,
                showscale: true,
                colorbar:{
                    thickness: 15,
                    ticksuffix: ' $',
                    ticks: 'outside',
                    ticklen: 5,
                }
            },
            hoverlabel: {namelength: 0},
            hovertemplate: "<b>Price</b>: %{customdata}  $ <br>%{text}"
        }
    ];

    var plotLayout = {
        dragmode: "zoom",
        mapbox: { style: "light", center: { lat: 40.70, lon: -73.95 }, zoom: 10 },
        margin: { r: 0, t: 0, b: 0, l: 0 },
    };

    var graphDiv = document.getElementById('scatter_map_container');
    
    if(update){
        var colors = [];
        for(var i = 0; i < dataset.length; i++) colors.push(dataset[i]['price']); //Starting color

        data.forEach(function(pt) {
            const index = dataset.findIndex( v => v == pt );
            colors[index] = '#941a20'; // Select color
        });

        var config = {responsive: true, mapboxAccessToken: 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiY2lxMnVvdm5iMDA4dnhsbTQ5aHJzcGs0MyJ9.X9o_rzNLNesDxdra4neC_A'};
        Plotly.react(graphDiv, plotData, plotLayout, config);
        Plotly.restyle(graphDiv, 'marker.color', [colors], [0]);
    } else {
        var config = {responsive: true, mapboxAccessToken: 'pk.eyJ1IjoiY2hyaWRkeXAiLCJhIjoiY2lxMnVvdm5iMDA4dnhsbTQ5aHJzcGs0MyJ9.X9o_rzNLNesDxdra4neC_A'};
        plot = Plotly.newPlot(graphDiv, plotData, plotLayout, config);
        graphDiv.on('plotly_selected', function(eventData) {
            if(!eventData) {eventData = {}; eventData.points = []}
            console.log(eventData.points);
            //console.log(data[eventData.points[0].pointIndex], eventData.points[0].pointIndex);

            var colors = [];
            for(var i = 0; i < dataset.length; i++) colors.push(dataset[i]['price']); //Starting color

            eventData.points.forEach(function(pt) {
                colors[pt.pointNumber] = '#941a20'; // Select color
            });

            Plotly.restyle(graphDiv, {selectedpoints: [null]}, [0]);
            Plotly.restyle(graphDiv, 'marker.color', [colors], [0]);

            pca.plotPCAScatterPlot(eventData, true);

        });
    }
}
