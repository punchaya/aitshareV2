const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const fs = require('fs');
const unzip = require('unzip');

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let database = "usermodels";

    const users = new userscontroller(response, mongodbport);

    this.Get = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);

        if (authenticated) {
            let query = { userid: data.userid };
            let collection = await mongo.FindRecord(database, query);
            return self.Return(collection);

        } else {
            return self.Return([]);
        }
    };

    this.Upload = async function (data, files) {
        try {
            let options = data.options;

            if (options) {
                options = JSON.parse(options);

                let authenticated = await users.Authenticate(options.credentials);

                if (authenticated) {
                    for (var name in files) {
                        if (Array.isArray(files[name])) {
                            for (let i = 0; i < files[name].length; i++) {
                                self.UploadFile(files[name][i], name, options);
                                break;
                            }
                        } else {
                            self.UploadFile(files[name], name, options);
                            break;
                        }
                    }

                } else {
                    return self.Return({ error: "Error", message: "Invalid user." });
                }
            } else {
                return self.Return({ error: "Error", message: "Invalid user." });
            }

        } catch (error) {
            console.log(JSON.stringify(error));
            return self.Return({ error: "Error", message: "Upload failed." });
        }
    };

    this.UploadFile = async function (file, name, options) {
        try {
            if (file) {
                var oldpath = file.path;

                var uuidv1 = require('uuid/v1');
                var guid = uuidv1();

                if (file.name) {
                    var split = file.name.split(".");
                    var extension = split[split.length - 1];

                    var originalname = file.name;
                    var filename = guid + "." + extension;
                    var newpath = "./public/models/" + filename;

                    if (extension === "zip") {
                        try {
                            fs.readFile(oldpath, function (err, data) {
                                if (err) {
                                    console.log("error in reading file");
                                }
                                else {
                                    // Write the file
                                    fs.writeFile(newpath, data, function (err) {
                                        if (err) {
                                            console.log("error in writing file");
                                        }
                                        else {
                                            let path = './public/models/' + guid;

                                            fs.createReadStream(newpath).pipe(unzip.Extract({
                                                path: path,

                                            }).on("close", function () {
                                                let filePath = path + "/database.txt";

                                                //Store 
                                                fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data1) {
                                                    if (!err) {

                                                        filePath = path + "/model.txt";

                                                        //Store 
                                                        fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data2) {
                                                            if (!err) {
                                                                data = Object.assign(JSON.parse(data1), JSON.parse(data2));
                                                                data.folder = guid;
                                                                data.userid = options.credentials.userid;

                                                                mongo.InsertRecord(database, data, function (response) {
                                                                    if (response) {
                                                                        return self.Return({ filename: guid, originalname: originalname, data: data });
                                                                    }
                                                                    else
                                                                        return self.Return(false);

                                                                });

                                                            } else {
                                                                console.log(JSON.stringify(e));
                                                                return self.Return(false);
                                                            }

                                                            fs.unlink(newpath, function (err) {
                                                            });
                                                        });

                                                    } else {
                                                        console.log(JSON.stringify(e));
                                                        return self.Return(false);
                                                    }
                                                });
                                            }));

                                            fs.unlink(oldpath, function (err) {
                                            });
                                        }
                                    });
                                }
                            });
                        } catch (e) {
                            console.log(JSON.stringify(e));
                            return self.Return(false);
                        }
                    } else {
                        console.log(JSON.stringify(e));
                        return self.Return(false);
                    }
                }
            }
            else {
                return self.Return(false);
            }
        } catch (error) {
            console.log(JSON.stringify(error));
            return self.Return(false);
        }
    };

    this.SaveImage = async function (data) {
        try {
            if (data) {
                let authenticated = await users.Authenticate(data.credentials);

                if (authenticated) {
                    if (response) {
                        let base64Data = data.image.replace(/^data:image\/png;base64,/, "");
                        let name;

                        if (data.filename) {
                            name = data.filename;
                            filename = "./public/models/" + name;
                        }
                        else {
                            let uuidv1 = require('uuid/v1');
                            let guid = uuidv1();

                            name = guid + ".png";
                            filename = "./public/models/" + name;
                        }

                        fs.writeFile(filename, base64Data, { encoding: 'base64', flag: 'w' }, function (err) {
                            if (!err) {
                                data = { _id: data._id, image: name };

                                mongo.UpdateRecord(database, data).then(function () {
                                    return self.Return(true);
                                });
                            }
                        });
                    }
                    else {
                        self.JSON(false);
                    }
                }
            }
            else
                return self.Return(false);

        } catch (error) {
            console.log(JSON.stringify(error));
            return self.Return(false);
        }
    };

    this.Authenticate = async function (data) {
        return new Promise((resolve, reject) => {
            try {
                if (data && data.token && data.fingerprint) {
                    let query = { userid: data.userid, token: data.token, fingerprint: data.fingerprint };
                    mongo.FindRecord("authentications", query).then(function (collection) {
                        if (collection.length)
                            resolve(true);
                        else
                            resolve(false);
                    });
                } else
                    resolve(false);

            } catch (error) {
                console.log(JSON.stringify(error));
                resolve(false);
            }
        });
    };
};