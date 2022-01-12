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
    let database = "discussion";



    this.PostDetails = async function (data) {
        let authenticated = await users.Authenticate(data.credentials);

        if (authenticated) {
            delete data.credentials;

            if (data._id) {
                await mongo.UpdateRecord(database, data);
            } else {
                await mongo.InsertRecord(database, data);
            }

            return self.Return(true);

        } else
            return self.Return(false);
    };

    this.GetAllComments = async function (data) {
        let query = { moduleid: data.moduleid };
        let collection = await mongo.FindRecord(database, query, {}, {});

        if (collection)
            return self.Return(collection);
    };

    this.DeleteMainTopic = async function (data) {
        let query = { _id: data.data._id, deleted: 1 };

        let collection = await mongo.UpdateRecord(database, query);

        if (collection)
            return self.Return(true);
        else
            return self.Return(false);
    };

    // this.DeleteReply = async function (data) {
    //     let query = { _id: data.data._id, deleted: 1 };

    //     let collection = await mongo.UpdateRecord(database, query);

    //     if (collection)
    //         return self.Return(true);
    //     else
    //         return self.Return(false);
    // };

    this.InsertNewTopic = async function (data) {
        let newtopic = await mongo.InsertRecord(database, data);
        // let username = data.username;
        let name = data.name;
        let mtitle = data.moduletitle;
        let moduleid = data.moduleid;
        let coursetitle = data.coursetitle;

        let text = data.text;

        if (newtopic) {
            //Query Admin Email
            let adminsemail = ["kpunchaya@ait.asia","jonathan.brenes@rrcap.ait.ac.th","asmita.Poudel@rrcap.ait.ac.th","elearning@rrcap.ait.ac.th"];
            // let adminsemail = ["kpunchaya@ait.asia"];
            // let query = { _id: objectid(data) };

            // let collection = await mongo.FindRecord("users", {}, ["_id", "name", "email", "admin"], {});

            // if (collection) {
            //     for (let i = 0; i < collection.length; i++) {
            //         if (collection[i].admin) {
            //             adminsemail.push(collection[i].email);
            //         }

            //     }
            // }           
            let messagetoadmin = {
                subject: "New Post : "+ coursetitle,
                message: "<p>&nbsp;</p><p align=\"left\">&nbsp;</p><table style=\"height: 514px; width: 446px;\" align=\"center\"><tbody><tr style=\"height: 346px;\"><td style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #666666; width: 440px; height: 346px;\" valign=\"top\"><div style=\"text-align: left; background-color: #fff; max-width: 900px;\"><div style=\"background-color: #ffffff; max-width: 900px; text-align: left;\"><div style=\"text-align: left;\"><a href=\"http://ehub.rrcap.ait.ac.th/\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"http://ehub.rrcap.ait.ac.th/public/images/email-header.png\" /> </a></div><div style=\"text-align: left;\">&nbsp;</div><div style=\"text-align: left;\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\"><span style=\"color: #888888;\"><span style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\">&nbsp;&nbsp;</span><br style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\" /><span style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\"><p><div>Dear Admin,</div><div><b>"+ name +"</b> has created a new post in <b>" + mtitle +"</b><div><div><br><blockquote style=\"background-color:#cccccc2e;\">" + text + "</blockquote><div></p></span></div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\"><a href=\"http://ehub.rrcap.ait.ac.th/\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"http://ehub.rrcap.ait.ac.th/public/images/email-footer.png\" /></a></div></div></td></tr></tbody></table>"
                // message: 
                        //"<div>Dear Admin,</div>" +
                //     "<div>&nbsp;<div>" +
                //     "<div>STUDENT NAME has created a new post in MODULE NUMBER<div>" +
                //     "<div><br><blockquote>" + text + "</blockquote><div>" 


            };

            // <p>&nbsp;</p><p align=\"left\">&nbsp;</p><table style=\"height: 514px; width: 446px;\" align=\"center\"><tbody><tr style=\"height: 346px;\"><td style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #666666; width: 440px; height: 346px;\" valign=\"top\"><div style=\"text-align: left; background-color: #fff; max-width: 900px;\"><div style=\"background-color: #ffffff; max-width: 900px; text-align: left;\"><div style=\"text-align: left;\"><a href=\"http://solutions.ait.ac.th/\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"http://solutions.ait.ac.th/wp-content/uploads/2018/09/aits-header.png\" /> </a></div><div style=\"text-align: left;\">&nbsp;</div><div style=\"text-align: left;\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\"><span style=\"color: #888888;\"><span style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\">&nbsp;&nbsp;</span><br style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\" /><span style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\"><strong>" + topictitle + "</strong> <br /><span style=\"font-size: 14px; color: #00577e;\">"+ data.editedby + " (Edited: " + data.date + ")</span><br /><br /> </span> </span></div><h3 style=\"text-align: left;\" align=\"left\"><span style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif;\"><span style=\"font-size: 14px;\"></span></span></h3><span style=\"font-size: 14px; text-align:justify\"><p>" + description + "</p></span></div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\"><a href=\"http://www.aitshare.ait.ac.th/\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"http://solutions.ait.ac.th/wp-content/uploads/2018/09/aits-footer.png\" /></a></div></div></td></tr></tbody></table>"

            self.SendEmail(messagetoadmin, adminsemail);

            return self.Return(true);
        }
        else
            return self.Return(false);
    };

    this.InsertNewComment = async function (data) {
        let name = data.name;
        let text = data.text;
        let postowneremail = data.username;
        let coursetitle = data.coursetitle;
        let mtitle = data.moduletitle;

        let newcomment = await mongo.InsertRecord(database, data);

        if (newcomment) {
            let adminsemail = ["kpunchaya@ait.asia"];
            // let adminsemail = ["kpunchaya@ait.asia","jonathan.brenes@rrcap.ait.ac.th","asmita.Poudel@rrcap.ait.ac.th"];

            let messagetoadmin = {
                subject: "Post Reply : "+ coursetitle,
                message: "<p>&nbsp;</p><p align=\"left\">&nbsp;</p><table style=\"height: 514px; width: 446px;\" align=\"center\"><tbody><tr style=\"height: 346px;\"><td style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #666666; width: 440px; height: 346px;\" valign=\"top\"><div style=\"text-align: left; background-color: #fff; max-width: 900px;\"><div style=\"background-color: #ffffff; max-width: 900px; text-align: left;\"><div style=\"text-align: left;\"><a href=\"http://ehub.rrcap.ait.ac.th/\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"http://ehub.rrcap.ait.ac.th/public/images/email-header.png\" /> </a></div><div style=\"text-align: left;\">&nbsp;</div><div style=\"text-align: left;\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\"><span style=\"color: #888888;\"><span style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\">&nbsp;&nbsp;</span><br style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\" /><span style=\"color: #00577e; font-family: Arial, Helvetica, sans-serif; font-weight: 400; text-align: start;\"><p>Activity on : " + mtitle +"</p><p><div>Dear Student,</div><div><b>"+ name +"</b> has commented on your <a href=\"http://ehub.rrcap.ait.ac.th/public/images/email-header.png\">post</a><div><div><br><blockquote style=\"background-color:#cccccc2e;\">" + text + "</blockquote><div></p></span></div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\">&nbsp;</div><div style=\"text-align: left;\" align=\"left\"><a href=\"http://ehub.rrcap.ait.ac.th/\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"http://ehub.rrcap.ait.ac.th/public/images/email-footer.png\" /></a></div></div></td></tr></tbody></table>"
            };
            self.SendEmail(messagetoadmin, adminsemail);
            return self.Return(true);
        }
        else
            return self.Return(false);
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