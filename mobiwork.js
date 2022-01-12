const http = require('http');
const fs = require('fs');
const formidable = require('formidable');
const domain = require('domain');
const mime = require('mime-types');

module.exports = function (param) {
    let self = this;

    let name = param.name;
    let port = param.port;
    let mongodbport = param.mongodb;

    this.run = function () {
        let server = http.createServer(function (request, response) {
            let _domain_ = domain.create();
            _domain_.on('error', function (er) {
                try {
                    console.log(er.message);
                    console.log(er.stack);

                    //send an error to the request that triggered the problem
                    response.statusCode = 500;
                    response.end('Error');
                }
                catch (er2) {
                    //oh well, not much we can do at this point.
                }
            });

            //Because req and res were created before this domain existed,
            //we need to explicitly add them.
            _domain_.add(request);
            _domain_.add(response);

            //Now run the handler function in the domain.
            _domain_.run(function () {
                let split = request.url.split("?");
                let url = split[0].split("/");;
                let querystring = split[1];
                let query;

                if (split.length > 1) {
                    query = querystring.split("&");

                    for (let i = 0; i < query.length; i++) {
                        query[i] = query[i].split("=");
                        query[i][1] = query[i][1].split("%20").join(" ");
                    }
                }

                if (url[1] && url[1].toLowerCase() === "api") {
                    //API
                    let controllername = url[2].toLowerCase();
                    let actionname = "Index";

                    if (url[3])
                        actionname = url[3];

                    self.api(controllername, actionname, request, response);

                } else if (url[1] && url[1].toLowerCase() === "public") {
                    //Public
                    self.web("", split[0], response, request);

                } else {
                    //Web
                    self.web("web", split[0], response, request);
                }
            });
        });

        server.listen(port);
        console.log(name);
        console.log("Port: " + port);

        let dateformat = require('dateformat');
        console.log("Date: " + dateformat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT"));
    };

    this.api = function (controllername, actionname, request, response) {
        if (controllername === "")
            controllername = "home";

        if (actionname === "" || !actionname)
            actionname = "Index";

        let file = './controllers/' + controllername + "controller.js";

        try {
            fs.stat(file, function (err) {
                if (err === null) {
                    let _module_ = require(file);
                    let _controller_ = new _module_(response, mongodbport);

                    if (request.method === 'OPTIONS') {
                        let headers = {};
                        headers["Access-Control-Allow-Origin"] = "*";
                        headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
                        headers["Access-Control-Allow-Credentials"] = false;
                        headers["Access-Control-Max-Age"] = '86400'; // 24 hours
                        headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";

                        response.writeHead(200, headers);
                        response.end();
                    }
                    else if (_controller_[actionname]) {

                        if (request.method === "POST") {
                            let form = new formidable.IncomingForm();
                            form.multiples = true;

                            form.parse(request, function (err, fields, files) {
                                _controller_[actionname](fields, files);
                            });
                        }
                        else {
                            _controller_[actionname]();
                        }
                    }
                    else {
                        response.writeHead(404, "text/html");
                        response.end("Error");

                        console.log("Url doesn't exists!");
                    }

                }
                else {
                    response.writeHead(404, "text/html");
                    response.end("Error");

                    console.log("Url doesn't exists!");
                }
            });
        } catch (e) {
            response.writeHead(404, "text/html");
            response.end("Error");

            console.log(JSON.stringify(e));
        }
    };

    this.web = function (directory, url, response, request) {
        //Web
        if (url === "/")
            url = "/index.html";

        let filepath = "./" + directory + url;
        filepath = filepath.split("%20").join(" ");

        fs.stat(filepath, function (err) {
            if (err === null) {
                let stat = fs.statSync(filepath);

                let headers = {};
                headers["Access-Control-Allow-Origin"] = "*";
                headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
                headers["Access-Control-Allow-Credentials"] = false;
                headers["Access-Control-Max-Age"] = '86400'; // 24 hours

                if (directory === "")
                    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";

                fs.readFile(filepath, function (err, data) {
                    let obj = mime.contentType(mime.lookup(filepath));
                    response.responseType = obj;

                    if (obj === "application/pdf")
                        headers["Content-Disposition"] = "attachment; filename=" + filepath.replace("./web/res/", "");

                    response.writeHead(200, headers);

                    response.end(data, obj);
                });
            }
            else {
                response.writeHead(404, "text/html");
                response.end("Error. Unable to find requested file.");
            }
        });
    };
};