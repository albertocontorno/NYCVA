class BarchartSelect{

    id;
    graphDiv;
    dataset = [];
    config = {responsive: true};
    margin = {
        l: 120,
        r: 40,
        b: 40,
        t: 0
    };

    layout = {
        yaxis: {
            tickangle: 0,
            title: {
                text: 'Neighbourhood',
                font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            }
        },
        xaxis: {
            title: {
                text: 'Avg. Price ($)',
                font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            }
        },
        margin: this.margin,
        height: '500'
    };
    dataByHoodFiltered = [];

    constructor(id, data){
        this.id = id;
        this.dataset = data;
    }

    draw(domElement, selectDomElement){
        const self = this;

        let select = $('#hoods_select');
    
        let hoods = d3.nest()
            .key(function(d) { return d['neighbourhood_group']; })
            .key(function(d) { return d['neighbourhood']; })
            .entries(self.dataset);
    
        hoods.forEach( group => {
            let groupElement = $(`<optgroup label="${group.key}"></optgroup>`);
            select.append(groupElement);
            group.values.forEach( hood => {
                let optionElement = $(`<option></option>`).attr('value', hood.key).text(hood.key);
                groupElement.append(optionElement);
            });
        });
    

        var dataByHood = d3.nest()
                    .key(function(d) { return d['neighbourhood'] } )   
                    .rollup(function(v) { return  {price: d3.mean(v, (el) => el['price'] ), group: v[0].neighbourhood_group}; })
                    .entries(self.dataset);
                    
        console.log(dataByHood);
        dataByHood.sort( (a,b)=> b['value']['price'] - a['value']['price']);
    
        $(document).ready(function() {
            self.graphDiv = document.getElementById('price_hood_selected');
            select.select2({ width: '100%' });
    
            var eventFromButton = {};
    
            const btn_top5 = $('#price_hood_top5');
            const btn_manhattan = $('#price_hood_manhattan');
            const btn_brooklyn = $('#price_hood_brooklyn');
            const btn_queens = $('#price_hood_queens');
            const btn_hood_si = $('#price_hood_si');
            const btn_hood_bronx = $('#price_hood_bronx');
            const buttons = [btn_top5, btn_manhattan, btn_brooklyn, btn_queens, btn_hood_si, btn_hood_bronx];
            
            btn_top5.click(self.selectTop5.bind(null, btn_top5, buttons, select, dataByHood, eventFromButton));
            btn_manhattan.click(self.selectHoodGroup.bind(null, btn_manhattan, buttons, select, dataByHood, 'Manhattan', eventFromButton));
            btn_brooklyn.click(self.selectHoodGroup.bind(null, btn_brooklyn, buttons, select, dataByHood, 'Brooklyn', eventFromButton));
            btn_queens.click(self.selectHoodGroup.bind(null, btn_queens, buttons, select, dataByHood, 'Queens', eventFromButton));
            btn_hood_si.click(self.selectHoodGroup.bind(null, btn_hood_si, buttons, select, dataByHood, 'Staten Island', eventFromButton));
            btn_hood_bronx.click(self.selectHoodGroup.bind(null, btn_hood_bronx, buttons, select, dataByHood, 'Bronx', eventFromButton));
    
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
                self.dataByHoodFiltered = dataByHood.filter( v => selectedHoods.includes(v.key));
                let w = self.dataByHoodFiltered.length > 10 ? 0.9 : 0.5;
                var plotData = [
                    {
                      x: self.dataByHoodFiltered.map( v => v.value.price ),
                      y: self.dataByHoodFiltered.map( v => v.key ),
                      width: w,
                      text: self.dataByHoodFiltered.map( v => parseFloat(v.value.price).toFixed(2) + ' $' ),
                      textposition: 'outside',
                      orientation: 'h',
                      type: 'bar',
                      hoverlabel: {namelength: 0},
                      hovertemplate: "<b>Neighbourhood</b>: %{y}<br><b>Avg. Price</b>: %{text}"
                    }
                ];
    
                Plotly.react(self.graphDiv, plotData, self.layout, self.config);     
                if(!firstTime){
                    selectedPointsDataset.length = 0;
                    updateCharts(self.id);
                }
                firstTime = false;
            });
    
            self.selectTop5(btn_top5, buttons, select, dataByHood, eventFromButton);
    
            self.graphDiv.on('plotly_selected', function(eventData) {
                if(!eventData) {eventData = {}; eventData.points = []}
                selectedPointsDataset.length = 0; //empty the array
                eventData.points.forEach( hood => {
                    let hoodName = hood.y;
                    self.dataset.forEach( (v,i) => {
                        if(v['neighbourhood'] === hoodName){
                            selectedPointsDataset.push(i);
                        };
                    });
                });
    
                var colors = [];
                for(var i = 0; i < self.dataByHoodFiltered.length; i++) colors.push('#1f77b4'); //Starting color
    
                eventData.points.forEach(function(pt) {
                    colors[pt.pointNumber] = '#941a20'; // Select color
                });
    
                Plotly.restyle(self.graphDiv, {selectedpoints: [null]}, [0]);
                Plotly.restyle(self.graphDiv, 'marker.color', [colors], [0]);
    
                updateCharts(self.id);
            });
        });
    }

    selectTop5(el, btns, select, dataByHood, eventFromButton){
        const top5 = dataByHood.slice(0, 5).map(v => v.key);
        eventFromButton.el = el;
        eventFromButton.new = true;
        select.val(null);
        select.val(top5).trigger('change');
    }
    
    selectHoodGroup(el, btns, select, dataByHood, name, eventFromButton){
        const hoods = [];
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

    deselect(){
        var colors = [];
        for(var i = 0; i < this.dataByHoodFiltered.length; i++) colors.push('#1f77b4'); //Starting color

        Plotly.restyle(this.graphDiv, {selectedpoints: [null]}, [0]);
        Plotly.restyle(this.graphDiv, 'marker.color', [colors], [0]);
    }
}