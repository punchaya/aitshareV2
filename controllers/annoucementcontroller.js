const basecontroller = require('../framework/basecontroller.js');
const mongodb = require('../framework/mongodbserver.js');
const userscontroller = require('./userscontroller.js');
const objectid = require('mongodb').ObjectID;

//Email
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const senderName = 'e-Learning Hub';
// const senderEmail = 'elearning@rrcap.ait.ac.th';
const senderEmail = 'aitshare@ait.asia';
const senderPassword = 'AITSolutions#2018$P';

module.exports = function (response, mongodbport) {
    basecontroller.call(this, response, mongodbport);

    let self = this;
    let mongo = new mongodb(mongodbport);
    let users = new userscontroller(response, mongodbport);
    let database = "annoucement";

    // const users = new userscontroller(response, mongodbport);

    this.Get = async function (data) {
        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated && data.userid) {
        // let query = { userid: data.userid };
        // let collection = await mongo.FindRecord(database, query, {}, {});
        // let collection = await mongo.FindRecord(database,{"term":1});
        let collection = await mongo.FindRecord(database, {}, {}, {});
        return self.Return(collection);

        // } else {
        //     return self.Return([]);
        // }
    };

    this.GetById = async function (data) {
        //let authenticated = await users.Authenticate(coursedata.credentials);

        // if (authenticated && coursedata)
        if (data) {
            let query = { _id: data._id };

            let collection = await mongo.FindRecord(database, query, {}, {});

            return self.Return(collection);

        } else {
            return self.Return([]);
        }
    };


    this.Insert = async function (data) {
        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated) {
        //     delete data.credentials;
        var coursetitle = data.coursetitle;
        var courseid = data.courseid;
        var name = data.name;
        var topic = data.topic;
        var text = data.message;
        var _text;


        //Convert Text Format
        let datasplit;
        let contenttext = "<div class='prescontent'>";
        let prevul = 0;
        let prevli = 0;
        let prevabc = 0;
        let prev123 = 0;

        datasplit = text.split("[");
        datasplit = text.split("[");
        for (let i = 0; i < datasplit.length; i++) {
            if (datasplit[i].includes("H]")) {
                let dataH = datasplit[i].replace("H]", "");
                contenttext += "<div class='prescontenth'>" + dataH + "<br></br></div>";
            } else if (datasplit[i].includes("P]")) {
                let dataP = datasplit[i].replace("P]", "");
                contenttext += "<div class='prescontentp' style='display:inline'>" + dataP + " </div> ";
            } else if (datasplit[i].includes("i]")) {
                let datai = datasplit[i].replace("i]", "");
                contenttext += "<div class='prescontenti'>" + datai + " </div> ";
            } else if (datasplit[i].includes("b]")) {
                let datab = datasplit[i].replace("b]", "");
                contenttext += "<div class='prescontentb'>" + datab + " </div> ";
            } else if (datasplit[i].includes("elink]")) {
                let dataEL = datasplit[i].replace("elink]", "");
                contenttext += "<div class='prescontentel' style='display:none'> " + dataEL + " </div> ";
            } else if (datasplit[i].includes("link]")) {
                let dataL = datasplit[i].replace("link]", "");
                contenttext += "<div class='prescontentl' style='display:inline'><button class='buttonl'> " + dataL + " </button></div> ";
            } else if (datasplit[i].includes("BR]")) {
                let dataBR = datasplit[i].replace("BR]", "");
                contenttext += "<div><br></div> ";
            } else if (datasplit[i].includes("URL]")) {
                let dataLtext;
                let dataURL = datasplit[i].replace("URL]", "");
                if (datasplit[i - 1].includes("Ltext]")) {
                    dataLtext = datasplit[i - 1].replace("Ltext]", "");
                    contenttext += "<div class='prescontenturl' style='display:inline'><a class='btn btn-success' href=' " + dataURL + " ' target='_blank'>" + dataLtext + "</a></div> ";
                } else {
                    contenttext += "<div class='prescontenturl' style='display:inline'><a class='btn btn-success' href=' " + dataURL + " ' target='_blank'>" + "click here." + "</a></div> ";
                }
            } else if (datasplit[i].includes("UL]")) {
                let dataUL = datasplit[i].replace("UL]", "");

                if (prevul === 0) {
                    prevul++;
                    contenttext += "<ul class='prescontentul'><br><li>" + dataUL + " </li> ";
                } else {
                    contenttext += "<li>" + dataUL + " </li> ";
                }

                if (i + 1 !== datasplit.length) {
                    if (!datasplit[i + 1].includes("UL]")) {
                        contenttext += "</ul><br>";
                    }
                } else if (i === datasplit.length - 1) {
                    contenttext += "</ul><br>";
                }

            } else if (datasplit[i].includes("OL]")) {
                let dataOL = datasplit[i].replace("OL]", "");

                if (prevli === 0) {
                    prevli++;
                    contenttext += "<ol class='prescontentol'><br><li>" + dataOL + " </li> ";
                } else {
                    contenttext += "<li>" + dataOL + " </li> ";
                }

                if (i + 1 !== datasplit.length) {
                    if (!datasplit[i + 1].includes("OL]")) {
                        contenttext += "</ol><br>";
                    }
                } else if (i === datasplit.length - 1) {
                    contenttext += "</ol><br>";
                }
            } else if (datasplit[i].includes("ABC]")) {
                let dataABC = datasplit[i].replace("ABC]", "");

                if (prevabc === 0) {
                    prevabc++;
                    contenttext += "<ol class='prescontentabc' type='A'><br><li>" + dataABC + " </li> ";
                } else {
                    contenttext += "<li>" + dataABC + " </li> ";
                }

                if (i + 1 !== datasplit.length) {
                    if (!datasplit[i + 1].includes("ABC]")) {
                        contenttext += "</ol><br>";
                    }
                } else if (i === datasplit.length - 1) {
                    contenttext += "</ol><br>";
                }
            } else if (datasplit[i].includes("123]")) {
                let data123 = datasplit[i].replace("123]", "");

                if (prev123 === 0) {
                    prev123++;
                    contenttext += "<ol class='prescontentabc' type='1'><br><li>" + data123 + " </li> ";
                } else {
                    contenttext += "<li>" + data123 + " </li> ";
                }

                if (i + 1 !== datasplit.length) {
                    if (!datasplit[i + 1].includes("123]")) {
                        contenttext += "</ol><br>";
                    }
                } else if (i === datasplit.length - 1) {
                    contenttext += "</ol><br>";
                }
            }
            else {
                contenttext += "<div class='text'>" + datasplit[0] + "</div>";
            }

        }
        _text = contenttext;

        if (data._id) {
            await mongo.UpdateRecord(database, data);
            return self.Return(true);
        } else {

            var query = { topic: topic, message: text, userid: data.userid, name: name, coursetitle: coursetitle };

            let insert = await mongo.InsertRecord(database, query);

            if (insert) {


                query = { courseid: courseid };
                let collection = await mongo.FindRecord("usercourse", query, {}, {})
                if (collection) {
                    let receiverids = [];
                    let ids = [];
                    for (let i = 0; i < collection.length; i++) {
                        if (!receiverids[collection[i].userid]) {
                            receiverids[collection[i].userid] = 1;
                            ids.push(objectid(collection[i].userid));
                        }
                    }
                    var output;
                    query = { _id: { $in: ids } };

                    let users = await mongo.FindRecord("users", query, {}, {})
                    if (users) {
                        output = users;
                        let rcvr = [];

                        for (let i = 0; i < output.length; i++) {
                            rcvr.push(output[i].email);
                        }
                        rcvr.push("kpunchaya@ait.asia","jonathan.brenes@rrcap.ait.ac.th","asmita.Poudel@rrcap.ait.ac.th","elearning@rrcap.ait.ac.th");

                        // let receiversemail = ["kpunchaya@ait.asia", "jonathan.brenes@rrcap.ait.ac.th", "asmita.Poudel@rrcap.ait.ac.th"];
                        let messagetoadmin = {
                            subject: "Announcement: " + coursetitle,
                            message: "<p>&nbsp;</p><p align=\"left\">&nbsp;</p><table style=\"height: 514px; width: 446px;\" align=\"center\"><tbody><tr style=\"height: 346px;\"><td style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #666666; width: 440px; height: 346px;\" valign=\"top\"><div style=\"text-align: left; background-color: #fff; max-width: 900px;\"><div style=\"background-color: #ffffff; max-width: 900px; text-align: left;\"><div style=\"text-align: left;\"><a href=\"http://ehub.rrcap.ait.ac.th/\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"http://ehub.rrcap.ait.ac.th/public/images/email-header.png\" /> </a></div><div style=\"text-align: left;\">&nbsp;</div><div style=\"text-align: left;\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\"><span style=\"color: #888888;\"><span style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\">&nbsp;&nbsp;</span><br style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\" /><span style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\"><p><div><b>" + topic + "</b></div><br><div>" + _text + "</div><br><div>posted by <b>" + name + "</b></div></p></span></div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\"><a href=\"http://ehub.rrcap.ait.ac.th/\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"http://ehub.rrcap.ait.ac.th/public/images/email-footer.png\" /></a></div></div></td></tr></tbody></table>"
                        };
                        self.SendEmail(messagetoadmin, rcvr);
                        return self.Return(insert);
                    }
                    else
                        return self.Return(false);
                }
                else
                    return self.Return(false);
            }
            else
                return self.Return(false);
        }


    };

    this.Delete = async function (data) {
        // let authenticated = await users.Authenticate(data.credentials);

        // if (authenticated) {
        if (data._id) {
            let update = await mongo.DeleteRecord(database, data);
            return self.Return(update);
        } else {
            return self.Return(false);
        }

        // } else {
        //     return self.Return(false);
        // }
    };

    this.SendEmail = function (data, receivers) {
        return new Promise((resolve, reject) => {
            let transporter = nodemailer.createTransport(smtpTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    user: senderEmail,
                    pass: senderPassword
                }
            }));

            let mailOptions = {
                from: senderName + "<" + senderEmail + ">",
                to: receivers,
                subject: data.subject,
                html: data.message
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    resolve(false);
                } else {
                    resolve(true);
                    console.log("Email sent!");
                }
            });
        });
    };
};