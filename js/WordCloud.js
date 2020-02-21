class WordCloud{

    myWords = [];
    data = [];
    fontMinSize = 15;
    fontMaxSize = 80;
    dictionaryThreshold = 5;
    stopwords = {
        'in': true,
        'to': true,
        'the': true,
        'of': true,
        'you': true,
        'at': true,
        'and': true,
        'for': true,
        'a': true,
        'w/': true,
        'with': true,
        'on': true
    };
    dictionary = []; //{word, size}
    crateDictionaryFromData = true;
    key = 'name';

    constructor(data){
        this.data = data;
    }

    plotWordCloud(){
        var self = this;
        // List of words
        const myWords = self.crateDictionaryFromData ? self.createDictionary(self.data, self.key) : self.dictionary;

        if(myWords.length === 0){
            console.error("[WordCloud] Error creating words");
            return;
        }

        const fontSizeScale = d3.scaleLinear().domain([myWords[myWords.length-1].size, myWords[0].size]).range([self.fontMinSize, self.fontMaxSize]);

        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 10, bottom: 10, left: 10},
            width = +document.querySelector("#word_cloud").clientWidth - margin.left - margin.right,
            height = +document.querySelector("#word_cloud").clientHeight - margin.top - margin.bottom;
            d3.select("#word_cloud").attr('viewBox', `0 0 ${width} ${height}`);
        // append the svg object to the body of the page
        var svg = d3.select("#word_cloud").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
    
        // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
        // Wordcloud features that are different from one word to the other must be here
        var layout = d3.layout.cloud()
            .size([width, height])
            .words(myWords.map(function(d) { return {text: d.word, size:d.size}; }))
            .padding(5)        //space between words
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .fontSize(function(d) { return fontSizeScale(d.size); })      // font size of words
            .on("end", draw);
        layout.start();
    
        // This function takes the output of 'layout' above and draw the words
        // Wordcloud features that are THE SAME from one word to the other can be here
        function draw(words) {
        svg.append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
                .data(words)
            .enter().append("text")
                .style("font-size", function(d) { return d.size; })
                .style("fill", "#69b3a2")
                .attr("text-anchor", "middle")
                .style("font-family", "Impact")
                .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; });
        }
    }

    createDictionary(data_, key){
        var self = this;

        var dictionaryObj = {};

        data_.forEach( v => {
            let value = v[key];
            value = value.replace(/\,|\?|\!|&|\(|\)|\"|\\|\-/g, '');
            
            value.split(' ').forEach( word => {
                word = word.toLowerCase();
                if(self.stopwords[word] || word === ""){
                    return;
                }
                let parsedWord = parseFloat(word);
                if (isNaN(parsedWord)){
                    dictionaryObj[word] = dictionaryObj[word] == null ? 1 : dictionaryObj[word]+1;
                }
            });
        });

        self.dictionary = [];
        for(const word in dictionaryObj){
            if(dictionaryObj[word] > self.dictionaryThreshold){
                self.dictionary.push({word: word, size: dictionaryObj[word]});
            }
        }

        self.dictionary = self.dictionary.sort( (a,b) => b.size - a.size);
        return self.dictionary;
    }
}