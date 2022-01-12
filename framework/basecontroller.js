const sharp = require('sharp');

module.exports = function (response) {
    var self = this;

    this.Error = function (error) {
        let dateFormat = require('dateformat');

        console.log("Error: " + error);
        console.log("Date: " + dateformat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT"));

        self.Return({ error: "ERROR", message: error });
    };

    this.Return = function (data) {
        var headers = {};
        headers["Access-Control-Allow-Origin"] = "*";
        headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
        headers["Access-Control-Allow-Credentials"] = true;
        headers["Access-Control-Max-Age"] = '86400'; // 24 hours
        headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
        headers["Content-Type"] = "application/json";

        response.writeHead(200, headers);
        response.end(JSON.stringify(data));
    };

    this.UploadFile = async function (files) {
        return new Promise((resolve, reject) => {
            for (var name in files) {
                if (Array.isArray(files[name])) {
                    let results = [];

                    for (let i = 0; i < files[name].length; i++) {
                        self.SaveFile(files[name][i], { directory: "./public/documents/" }).then(function (upload) {
                            if (upload)
                                results.push(upload);

                            if (i === files[name].length - 1)
                                resolve(results);
                        });
                    }
                } else {
                    self.SaveFile(files[name], { directory: "./public/documents/" }).then(function (upload) {
                        if (upload)
                            resolve(upload);
                        else
                            resolve(false);
                    });
                }
            }
        });
    };

    this.SaveFile = async function (file, param) {
        return new Promise((resolve, reject) => {
            try {
                if (file) {
                    var oldpath = file.path;

                    var uuidv1 = require('uuid/v1');
                    var guid = uuidv1();

                    if (file.name) {
                        var split = file.name.split(".");
                        var extension = split[split.length - 1];

                        if (extension)
                            extension = extension.toLowerCase();

                        var originalname = file.name;
                        var filename = guid + "." + extension;
                        var newpath = param.directory + filename;

                        try {
                            var fs = require('fs');
                            fs.readFile(oldpath, function (err, data) {
                                if (err) {
                                    console.log(JSON.stringify(err));
                                    resolve(false);
                                }
                                else {
                                    // Write the file
                                    fs.writeFile(newpath, data, function (err) {
                                        if (err) {
                                            console.log(JSON.stringify(err));
                                            resolve(false);
                                        }
                                        else {
                                            //Save thumbnail
                                            if (extension === "jpg" || extension === "jpeg" || extension === "png") {
                                                let thumbfilename = "thumbnail_" + guid + "." + extension;
                                                let thumbnail = param.directory + thumbfilename;

                                                sharp(newpath)
                                                .resize(128, 128)
                                                .toFile(thumbnail, (err, info) => { 
                                                    resolve({
                                                        filename: filename,
                                                        name: originalname,
                                                        date: new Date().toISOString()
                                                    });
                                                });
                                            } else {
                                                resolve({
                                                    filename: filename,
                                                    name: originalname,
                                                    date: new Date().toISOString()
                                            });
                                            }

                                            fs.unlink(oldpath, function (err) {
                                            });
                                        }
                                    });
                                }
                            });
                        } catch (e) {
                            console.log(JSON.stringify(e.message));
                            resolve(false);
                        }
                    }
                }
                else {
                    resolve(false);
                }
            } catch (e) {
                console.log(JSON.stringify(e.message));
                resolve(false);
            }
        });
    };
};