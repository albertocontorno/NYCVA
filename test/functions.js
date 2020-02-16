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
                .rollup(function(v) { return  {price: d3.mean(v, (el) => el['price'] ), group: v[0].neighbourhood_group}; })
                .entries(data);
                
    console.log(dataByHood)
    dataByHood.sort( (a,b)=> b['value']['price'] - a['value']['price']);

    $(document).ready(function() {
        var graphDiv = document.getElementById('price_hood_selected')
        select.select2({ width: '100%' });

        var eventFromButton = {};

        const btn_top5 = $('#price_hood_top5');
        const btn_manhattan = $('#price_hood_manhattan');
        const btn_brooklyn = $('#price_hood_brooklyn');
        const btn_queens = $('#price_hood_queens');
        const btn_hood_si = $('#price_hood_si');
        const btn_hood_bronx = $('#price_hood_bronx');
        const buttons = [btn_top5, btn_manhattan, btn_brooklyn, btn_queens, btn_hood_si, btn_hood_bronx];
        
        btn_top5.click(selectTop5.bind(null, btn_top5, buttons, select, dataByHood, eventFromButton));
        btn_manhattan.click(selectHoodGroup.bind(null, btn_manhattan, buttons, select, dataByHood, 'Manhattan', eventFromButton));
        btn_brooklyn.click(selectHoodGroup.bind(null, btn_brooklyn, buttons, select, dataByHood, 'Brooklyn', eventFromButton));
        btn_queens.click(selectHoodGroup.bind(null, btn_queens, buttons, select, dataByHood, 'Queens', eventFromButton));
        btn_hood_si.click(selectHoodGroup.bind(null, btn_hood_si, buttons, select, dataByHood, 'Staten Island', eventFromButton));
        btn_hood_bronx.click(selectHoodGroup.bind(null, btn_hood_bronx, buttons, select, dataByHood, 'Bronx', eventFromButton));

        eventFromButton['btns'] = buttons;
        eventFromButton.new = false;
        eventFromButton.el = null;
        var firstTime = true;
        select.on('change.select2', e => {
            if(eventFromButton.new){
                eventFromButton.btns.forEach( b => b.removeClass('selected'));
                eventFromButton.el.addClass('selected');
            } else {
                
                buttons.forEach( b => b.removeClass('selected'));
            }
            eventFromButton.new = null;

            var selectedHoods = select.select2('data').map( v => v.id );
            dataByHoodFiltered = dataByHood.filter( v => selectedHoods.includes(v.key));

            var plotData = [
                {
                  x: dataByHoodFiltered.map( v => v.value.price ),
                  y: dataByHoodFiltered.map( v => v.key ),
                  text: dataByHoodFiltered.map( v => parseFloat(v.value.price).toFixed(2) + ' $' ),
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
                }
            ];

            Plotly.react(graphDiv, plotData, layout, config);
            if(!firstTime) plotLocationScatterPlot([], true);
            firstTime = false;
        });

        selectTop5(btn_top5, buttons, select, dataByHood, eventFromButton);

        graphDiv.on('plotly_selected', function(eventData) {
            if(!eventData) {eventData = {}; eventData.points = []}
            console.log(eventData.points)
            let selectedDataPoints = [];
            eventData.points.forEach( hood => {
                let hoodName = hood.y;
                selectedDataPoints.push(...data.filter( v => v['neighbourhood'] === hoodName));
            });

            var colors = [];
            for(var i = 0; i < dataByHoodFiltered.length; i++) colors.push('#1f77b4'); //Starting color

            eventData.points.forEach(function(pt) {
                colors[pt.pointNumber] = '#941a20'; // Select color
            });

            Plotly.restyle(graphDiv, {selectedpoints: [null]}, [0]);
            Plotly.restyle(graphDiv, 'marker.color', [colors], [0]);

            plotLocationScatterPlot(selectedDataPoints, true);
        });

        
    });
}

function selectTop5(el, btns, select, dataByHood, eventFromButton){
    const top5 = dataByHood.slice(0, 5).map(v => v.key);
    eventFromButton.el = el;
    eventFromButton.new = true;
    select.val(null);
    select.val(top5).trigger('change');
}

function selectHoodGroup(el, btns, select, dataByHood, name, eventFromButton){
    const hoods = []
    eventFromButton.el = el;
    eventFromButton.new = true;
    dataByHood.map(v => {
        if(v.value.group === name){
            return hoods.push(v.key)
        }
    });
    select.val(null);
    select.val(hoods).trigger('change');
}

function triggerChange(fromButton = true){
    if(!fromButton){

    }
}

// MAP
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
        Plotly.newPlot(graphDiv, plotData, plotLayout, config);
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
