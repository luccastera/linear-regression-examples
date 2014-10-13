var csvParse = require('csv-parse'),
    fs = require('fs'),
    ss = require('simple-statistics'),
    _ = require('underscore');

var apiKey = process.env.PLOTLY_API_KEY;
var username = process.env.PLOTLY_USERNAME;
var plotly = require('plotly')(username,apiKey);

fs.readFile('data/cars.data', 'utf8', function(err, dataStr) {
  csvParse(dataStr, {delimiter: ',', auto_parse: true}, function(err, data) {
    // First, clean up the training data by eliminating rows that have invalid values
    var cleanData = _.filter(data, function(d) { return typeof d[0] === 'number' && typeof d[1] === 'number'; });

    // We are only going two columns:
    //     x: horsepower
    //     y: price of car
    var xAndY = cleanData.map(function(h) { return [h[21], h[25]]; });
    var x = cleanData.map(function(h) { return h[21]; }); // x is horsepower
    var y = cleanData.map(function(h) { return h[25]; }); // y is price


    // Use simple-statistics library to get the linear regression function called 'line'
    var line = ss.linear_regression().data(xAndY).line();


    // Use the linear regression function to get a set of data to graph the linear regression line
    var y2 = [];
    x.forEach(function(xi) {
      y2.push(line(xi));
    });

    // Create scatter plots of training data + linear regression function
    var layout = {
      title: 'Car Prices vs Horsepower',
      xaxis: {
        title: 'Horsepower'
      },
      yaxis: {
        title: 'Price in $'
      }
    };
    var trace1 = {
      x: x,
      y: y,
      name: 'Training Data',
      mode: "markers",
      type: "scatter"
    };
    var trace2 = {
      x: x,
      y: y2,
      name: 'Linear Regression',
      mode: "lines",
      type: "scatter"
    };
    var plotData = [trace1, trace2];
    var graphOptions = {layout: layout,filename: "cars-linear-regression", fileopt: "overwrite"}
    plotly.plot(plotData, graphOptions, function (err, msg) {
      console.log(msg);
    });
  });
});

