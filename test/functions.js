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
