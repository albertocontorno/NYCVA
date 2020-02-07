console.log(d3)
setInterval( () =>d3.selectAll("p").style("color", function() {
    return "hsl(" + Math.random() * 360 + ",100%,50%)";
}), 500);
setInterval( () =>d3.select("body").transition().style("background-color", function() {
    return "hsl(" + Math.random() * 360 + ",100%,50%)";
}), 500);
setInterval( () => d3.selectAll("p")
  .data([Math.round(Math.random()*50), Math.round(Math.random()*50), Math.round(Math.random()*50), Math.round(Math.random()*50), Math.round(Math.random()*50), Math.round(Math.random()*50)])
  .transition().style("font-size", function(d) { return d + "px"; }), 500);

