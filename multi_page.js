var http = require('http');
var url = require('url');
var fs = require('fs');

// set port
var port = process.env.PORT || 3000;

const MongoClient = require('mongodb').MongoClient;

const connStr = "mongodb+srv://benjaminli:Strawberry13!@cluster0.7xrbawh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    urlObj = url.parse(req.url, true)
    path = urlObj.pathname;

    if (path == "/") {
        // display form on page
        form = "<form action = '/process' method = 'GET'>" + "<label for='searchValue'>Search:</label>" + 
        "<input type='text' id='searchValue' name='searchValue' required><br>" +
        "<input type='radio' id='ticker' name='searchType' value='ticker'>" +
        "<label for='ticker'>Ticker Symbol</label><br>" +
        "<input type='radio' id='company' name='searchType' value='company'>" +
        "<label for='company'>Company Name</label><br>" +
        "<button type='submit'>Submit</button>" +
        "</form>";

        res.write(form);
    }
    else if (path == "/process") {
        res.write("Processing (check console for results)");

        // get search value and search type parameters from url
        var searchVal = url.parse(req.url, true).query.searchValue;
        var searchType = url.parse(req.url, true).query.searchType;
        
        MongoClient.connect(connStr, function(err, db) {
            if (err) {
                return console.log(err);
            }

            var dbo = db.db("Stock");
            var collection = dbo.collection("PublicCompanies");

            var query = {};
            if (searchType == "ticker") {
                query = { ticker: searchVal };
            } else {
                query = { company: searchVal };
            }

            collection.find(query).toArray(function(err, items) {
                if (err) {
                    return console.log(err);
                }

                items.forEach(company => {
                    console.log("Company Name: " + company.company + "; Stock Ticker: " + company.ticker + "; Stock Share Price: " + company.price);
                });

                db.close();
            });
        });
    }

    res.end();
}).listen(port);