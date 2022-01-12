var studentcontentview = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let viewparent;
    let tablecontainer;
    let splitrightcontainer;
    let splittercomment;
    let tab;
    let readonly = false;
    let moduleid;
    // let moduletitle = param.dataobject.title;
    // $MODTITLE = param.dataobject.title;
    // let moduletitle = $MODTITLE;
    let moduletitle;
    let moduledata;
    let courseiddata;
    let presentationdata;
    let prestype;

    let containertop;
    let containerbot;
    let containerbotleft;
    let containerbotright;

    let coursetitle = course[0].title.value;

    let containerlistpresentation;

    let passthrough;

    let firstinsertdone = false;

    // let _desc = $MODDESC;
    let _desc;



    if (param.courseiddata)
        courseiddata = param.courseiddata;

    if (param.dataobject) {

        param = param.dataobject;
        $MODTITLE = param.title;
    }



    if (param) {
        if (param.moduleid)
            moduleid = param.moduleid;
        else
            moduleid = param._id;

        if (param.model)
            model = param.model;

        if (param.children)
            course = param.children;

        if (param.readonly)
            readonly = param.readonly;


        if (param.description) {
            _desc = param.description;
            $MODDESC = _desc;
        }
    }

    this.Show = function (parent) {
        if (parent) {
            viewparent = parent;
            viewparent.Clear();
        }

        passthrough = true;

        if (viewparent.courseiddata)
            courseiddata = viewparent.courseiddata;

        let back = new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                // let homepage = new studentcourseview();
                // homepage.Show(viewparent);

                let homepage = new studentcourseview();
                homepage.Show(viewparent);
                homepage.GetModulesWithPercent(courseiddata);

                // homepage.ShowModules(courseiddata);
            }
        });

        tablecontainer = new mobiwork.SplitContainer({
            gap: 1,
            class: "contentview",
            children: [{ size: 480 }]
        });

        tablecontainer.Show(parent);
        back.Show(parent);

        self.ShowLeftPanel();
        self.ShowRightPanel();
    };

    this.ShowLeftPanel = function (parent) {
        let container = new mobiwork.ScrollContainer();

        if (parent)
            container.Show(tablecontainer);
        else
            tablecontainer.Set(0, container);

        self.GetModuleIDLog(moduleid);
    };

    this.RefreshPresentationList = function (parent) {
        containerlistpresentation = new mobiwork.Container({ class: " presentation-list-container" });

        let listpresentation = containerlistpresentation.Add(new mobiwork.ScrollContainer());

        let presicon;
        let stopaddcontinue = true;
        let presitem = [];
        // let prestext;

        let data = { userid: $ACCOUNT.user._id, moduleid: moduleid };
        mobiwork.POST($API + "presentation/Get", JSON.stringify(data)).then(function (response) {
            response.sort(function (a, b) {
                _a = parseInt(a.order);
                _b = parseInt(b.order);

                if (_a > _b)
                    return 1;
                else if (_a < _b)
                    return -1;
                else
                    return 0;
            });

            for (let i = 0; i < response.length; i++) {
                switch (response[i].type) {
                    case "video":
                        presicon = "video";
                        // prestext = response[i].length
                        break;
                    case "slide":
                        presicon = "newspaper-variant-multiple";
                        break;
                    case "reference":
                        presicon = "cloud-download-outline";
                        break;
                    case "quiz":
                        presicon = "clipboard-text-outline";
                        break;
                }

                presitem.push(listpresentation.Add(new mobiwork.List({
                    icon: "checkbox-blank-outline", //"checkbox-marked",
                    text: response[i].title,
                    data: response[i],
                    class: "presentation-items",
                    tools: [
                        new mobiwork({
                            class: "student-pres-icon",
                            icon: presicon
                        })
                        // ,
                        // new mobiwork({ text: "test", class: "student-pres-text" })
                    ],
                    onclick: function (data) {
                        let count = parseInt(data.data.order) + 1;

                        let tttt = data.object.hasClass("disable");
                        console.log(tttt);

                        let openreference = $PUBLIC + "documents/" + data.data.file;
                        let reflink = data.data.link;

                        if (data.data.type === "reference") {
                            if (data.data.file)
                                window.open(openreference, "_blank");
                            else
                                window.open(reflink, "_blank");
                        }

                        presentationdata = data.data;

                        if (data.class.includes("continue")) {
                            if (data.data.type === "slide") {
                                let slidepercent = { userid: $ACCOUNT.user._id, presentationid: presentationdata._id };
                                mobiwork.POST($API + "userslidelog/SummaryLog", JSON.stringify(slidepercent)).then(function (response) {
                                    if (response === 100) {
                                        let pushitems_ = { userid: $ACCOUNT.user._id, moduleid: presentationdata.moduleid, presentationid: presentationdata._id, complete: 1 };
                                        mobiwork.POST($API + "userpresentationlog/Insert", JSON.stringify(pushitems_)).then(function (response) {
                                            if (response) {
                                                self.GetModuleIDLog(moduleid);
                                            }
                                        });
                                    }
                                });
                            } else if (data.data.type === "quiz") {
                                let checkthisdata = { userid: $ACCOUNT.user._id, presentationid: presentationdata._id };

                                mobiwork.POST($API + "userquiz/CheckRemarks", JSON.stringify(checkthisdata)).then(function (checkresp) {
                                    if (checkresp) {
                                        let pushitems_ = { userid: $ACCOUNT.user._id, moduleid: presentationdata.moduleid, presentationid: presentationdata._id, complete: 1 };

                                        mobiwork.POST($API + "userpresentationlog/Insert", JSON.stringify(pushitems_)).then(function (response) {
                                            if (response) {
                                                self.GetModuleIDLog(moduleid);
                                            }
                                        });
                                    }
                                });
                            } else {
                                let pushitems_ = { userid: $ACCOUNT.user._id, moduleid: presentationdata.moduleid, presentationid: presentationdata._id, complete: 1 };

                                mobiwork.POST($API + "userpresentationlog/Insert", JSON.stringify(pushitems_)).then(function (response) {
                                    if (response) {
                                        self.GetModuleIDLog(moduleid);
                                    }
                                });
                            }
                        }

                        self.ShowTopPanel();
                        self.ShowBotPanel();
                    }
                })));

                presitem[i].class += " disable";

                if (response[i].type === "slide") {
                    let slidepercent = { userid: $ACCOUNT.user._id, presentationid: response[i]._id };

                    mobiwork.POST($API + "userslidelog/SummaryLog", JSON.stringify(slidepercent)).then(function (response_log) {
                        if (response_log) {
                            let progress = presitem[i].Add(new mobiwork.ProgressBarRRCAP({ percentage: response_log }));
                            progress.class += " slide_progress";
                            listpresentation.Refresh();

                            if (response_log === 100) {
                                let pushitems_ = { userid: $ACCOUNT.user._id, moduleid: response[i].moduleid, presentationid: response[i]._id, complete: 1 };

                                mobiwork.POST($API + "userpresentationlog/Insert", JSON.stringify(pushitems_)).then(function (response) {
                                    if (response) {
                                        if (passthrough) {
                                            passthrough = false;
                                            self.GetModuleIDLog(moduleid);
                                        }
                                    }
                                });
                            }
                        }
                    });
                }

                for (let ii = 0; ii < listdatapresentationlog.length; ii++) {
                    if (response[i]._id === listdatapresentationlog[ii].presentationid) {
                        if (listdatapresentationlog[ii].complete === 1) {
                            presitem[i].class = "list presentation-items";
                            presitem[i].icon = "checkbox-marked";
                            stopaddcontinue = false;
                        }
                    }
                }

                if (i === listdatapresentationlog.length) {
                    // if (i === listdatapresentationlog.length - 1) {
                    presitem[i].class = "list presentation-items";
                    presitem[i].class += " continue";
                    presitem[i].icon = "checkbox-blank-outline";
                }
                listpresentation.Refresh();
            }

            if (parent)
                containerlistpresentation.Show(tablecontainer);
            else
                tablecontainer.Set(0, containerlistpresentation);
        });
    };

    this.ShowRightPanel = function (parent) {
        let container = new mobiwork.ScrollContainer();
        splitrightcontainer = container.Add(new mobiwork.SplitContainer({
            orientation: ORIENTATION.VERTICAL,
            gap: 2
            // children: [{ size: 300 }]
        }));

        // console.log(prestype);

        if (parent)
            container.Show(parent);
        else
            tablecontainer.Set(1, container);

        self.ShowTopPanel();
        self.ShowBotPanel();
    };

    this.ShowTopPanel = function (parent) {
        containertop = new mobiwork.ScrollContainer({ class: "content-container-top" });

        containertop.Add(new mobiwork.Header({ text: $MODTITLE }));
        containertop.Add(new mobiwork.Image({ src: $PUBLIC + "/images/mbanner.jpg", class: " banner" }));
        if (presentationdata) {
            containertop.Clear();
            switch (presentationdata.type) {
                case "video":
                    containertop.Add(new mobiwork.YoutubeContainer({
                        src: presentationdata.url
                    }));

                    self.UpdateProgress();
                    break;

                case "slide":
                    // let checkpresid = { presentationid: presentationdata._id };

                    // mobiwork.POST($API + "userslidelog/GetByPresentationID", JSON.stringify(checkpresid)).then(function (_response_) {
                    //     if (!_response_) {
                    //         let stype;
                    //         let pushitems_;

                    //         let _data_ = { presentationid: presentationdata._id };
                    //         mobiwork.POST($API + "slide/Get", JSON.stringify(_data_)).then(function (response) {
                    //             response.sort(function (a, b) {
                    //                 _a = parseInt(a.order);
                    //                 _b = parseInt(b.order);

                    //                 if (_a > _b)
                    //                     return 1;
                    //                 else if (_a < _b)
                    //                     return -1;
                    //                 else
                    //                     return 0;
                    //             });

                    //             for (let i = 0; i < response.length; i++) {
                    //                 if (response[i].type === "Presentation")
                    //                     stype = "slide";
                    //                 else
                    //                     stype = "exercise";

                    //                 if (i === 0)
                    //                     pushitems_ = { userid: $ACCOUNT.user._id, slideid: response[i]._id, presentationid: response[i].presentationid, complete: 1, type: stype };
                    //                 else
                    //                     pushitems_ = { userid: $ACCOUNT.user._id, slideid: response[i]._id, presentationid: response[i].presentationid, complete: 0, type: stype };


                    //                 mobiwork.POST($API + "userslidelog/Insert", JSON.stringify(pushitems_)).then(function (response_) {
                    //                     if (response_) { }
                    //                 });
                    //             }
                    //         });
                    //     }

                    let studentpresentation = new studentpresentationview(presentationdata);
                    viewparent.courseiddata = courseiddata;
                    studentpresentation.Show(viewparent);
                    // });
                    break;

                case "reference":
                    containertop.Add(new mobiwork.Header({ text: "reference" }));
                    break;

                case "quiz":
                    let studentexcequiz = new studentquizview(presentationdata);
                    studentexcequiz.Show(viewparent);
                    break;

            }

        } else { }

        if (parent)
            containertop.Show(parent);
        else
            splitrightcontainer.Set(0, containertop);
    };

    this.ShowBotPanel = function (parent) {
        containerbot = new mobiwork.Container();
        tab = containerbot.Add(new mobiwork.Tab({
            // class: model.submitted ? "form-readonly" : "form-editable",
            children: [
                { icon: "book-information-variant", text: "Overview" },
                { icon: "comment-text-outline", text: "Discussions" },
                { icon: "link", text: "References" }

            ]
        }));

        if (parent)
            containerbot.Show(parent);
        else
            splitrightcontainer.Set(1, containerbot);

        self.ShowOverview();
        self.ShowDiscussion();
        self.ShowReference();
    };

    this.ShowOverview = function (parent) {
        let scontainer = new mobiwork.ScrollContainer({ class: "overview" });
        let overview;

        if ($MODDESC) {
            _desc = $MODDESC;
        }

        overview = scontainer.Add(new mobiwork.Text({ text: _desc, readonly: true }));

        if (parent)
            scontainer.Show(parent);
        else
            tab.Set(0, scontainer);
    };

    this.CheckStatus = function () {
        let dataprogress = ({
            userid: $ACCOUNT.user._id,
            moduleid: presentationdata.moduleid,
            presentationid: presentationdata._id
        });

        let data = { userid: $ACCOUNT.user._id };

        mobiwork.POST($API + "userprogress/Get", JSON.stringify(data)).then(function (response) {
            if (response) {
                for (let i = 0; i > response.length; i++) {

                }
            }
        });
    };

    this.UpdateProgress = function () {
        console.log(presentationdata);
        // let temp = presitem.object.hasClass("disable");
        // console.log(temp);

        // presitem.removeClass('disable');
        let dataprogress = ({
            userid: $ACCOUNT.user._id,
            moduleid: presentationdata.moduleid,
            presentationid: presentationdata._id,
            complete: 1 // TO BE UPDATE SOON AS WE GOT TIME IN VIDEO
        });

        let data = { userid: $ACCOUNT.user._id };

        mobiwork.POST($API + "userprogress/Get", JSON.stringify(data)).then(function (response) {
            if (response.length !== 0) {
                for (let i = 0; i < response.length; i++) {
                    if (response[i].userid === $ACCOUNT.userid._id && response[i].moduleid === presentationdata.moduleid && response[i].presentationid === presentationdata._id) {

                        mobiwork.POST($API + "userprogress/Update", JSON.stringify(dataprogress)).then(function (response) {
                            if (response) { console.log("Updated"); }
                        });
                    } else {
                        if (i = response.length - 1) {
                            mobiwork.POST($API + "userprogress/Insert", JSON.stringify(dataprogress)).then(function (response) {
                                if (response) { console.log("Inserted"); }
                            });
                        }
                    }
                }
            } else {
                mobiwork.POST($API + "userprogress/Insert", JSON.stringify(dataprogress)).then(function (response) {
                    if (response) { console.log("Inserted"); }
                });
            }
        });

    };

    this.ShowDiscussion = function (parent) {
        let scontainer = new mobiwork.ScrollContainer();
        splittercomment = scontainer.Add(new mobiwork.SplitContainer({
            class: "discussion-splitter",
            children: [{ size: 250 }],
            orientation: ORIENTATION.VERTICAL
        }));


        if (parent)
            scontainer.Show(parent);
        else
            tab.Set(1, scontainer);

        self.ShowComments();
        self.ShowAddNewTopic();
    };

    this.ShowComments = function (parent) {
        containerbotleft = new mobiwork.ScrollContainer({ class: "comment-container-bot-left" });
        let replycontainer = [];
        let replytext;
        let query = { moduleid: moduleid };
        let finaltext1;
        let finaltext2;

        mobiwork.POST($API + "discussion/GetAllComments", JSON.stringify(query)).then(function (response) {
            if (response) {
                for (let i = 0; i < response.length; i++) {
                    if (response[i].type === "topic") {
                        if (response[i].deleted === undefined)
                            response[i].deleted = 0;

                        if (response[i].deleted !== 1) {
                            containerbotleft.Add(new mobiwork({ icon: "account", class: "userimage-comment" }));

                            if (response[i].text === undefined)
                                response[i].text = " ";

                            let textcontent = [];
                            let datasplit = response[i].text.split(" ");
                            for (let x = 0; x < datasplit.length; x++) {
                                if (datasplit[x].includes("https://")) {
                                    textcontent.push("<a href=" + datasplit[x] + ">" + datasplit[x] + "</a>");
                                } else {
                                    textcontent.push(datasplit[x]);
                                }

                                if (x === datasplit.length - 1) {
                                    finaltext1 = textcontent.join(" ");
                                }
                            }

                            containerbotleft.Add(new mobiwork.List({
                                text: "<b>" + response[i].name + "</b><br>" + finaltext1,
                                // text: "<b>" + response[i].name + "</b><br>" + response[i].text,
                                class: "discussion-topic",
                                // icon: "account"
                            }));
                            let buttonscommentcont = containerbotleft.Add(new mobiwork.Container({ class: "buttons-comment-container" }));
                            let replybutton = buttonscommentcont.Add(new mobiwork({
                                text: "Reply",
                                class: "reply-button",
                                data: { data: response[i], index: i },
                                onclick: function (data) {
                                    let temp2;
                                    if (replycontainer[data.data.index].children.length !== 0)
                                        temp2 = replycontainer[data.data.index].children.length - 1;
                                    else
                                        temp2 = undefined;

                                    if (temp2 !== undefined) {
                                        if (replycontainer[data.data.index].children[temp2].class.includes("comment-box")) {
                                            replycontainer[data.data.index].Refresh();
                                        } else {
                                            replytext = replycontainer[data.data.index].Add(new mobiwork.InputText({
                                                placeholder: "Write a comment...",
                                                class: "comment-box",
                                                onenter: function () {
                                                    let insertcomment = { userid: $ACCOUNT.userid, name: $ACCOUNT.user.name, username: $ACCOUNT.user.email, moduleid: moduleid, moduletitle: $MODTITLE, type: "comment", text: replytext.value, topicid: response[i]._id, coursetitle: coursetitle };

                                                    mobiwork.POST($API + "discussion/InsertNewComment", JSON.stringify(insertcomment)).then(function (response) {
                                                        if (response === true) {
                                                            self.ShowComments();
                                                        } else {
                                                            containerbotright.Add(new mobiwork.Header({ text: "No comments in this module." }));
                                                            self.ShowComments();
                                                        }
                                                    });
                                                }
                                            }));
                                            replycontainer[data.data.index].Refresh();
                                        }
                                    } else {
                                        replytext = replycontainer[data.data.index].Add(new mobiwork.InputText({
                                            placeholder: "Write a comment...",
                                            class: "comment-box",
                                            onenter: function () {
                                                let insertcomment = { userid: $ACCOUNT.userid, name: $ACCOUNT.user.name, username: $ACCOUNT.user.email, moduleid: moduleid, moduletitle: $MODTITLE, type: "comment", text: replytext.value, topicid: response[i]._id, coursetitle: coursetitle };

                                                mobiwork.POST($API + "discussion/InsertNewComment", JSON.stringify(insertcomment)).then(function (response) {
                                                    if (response === true) {
                                                        self.ShowComments();
                                                    } else {
                                                        containerbotright.Add(new mobiwork.Header({ text: "No comments in this module." }));
                                                        self.ShowComments();
                                                    }
                                                });
                                            }
                                        }));
                                        replycontainer[data.data.index].Refresh();
                                    }

                                    // }
                                }
                            }));

                            if (response[i].userid === $ACCOUNT.userid) {
                                let deletetopicbutton = buttonscommentcont.Add(new mobiwork({
                                    text: "Delete",
                                    class: "delete-button",
                                    data: { data: response[i], index: i },
                                    onclick: function (data) {
                                        let datadeletetopic = data.data;
                                        mobiwork.POST($API + "discussion/DeleteMainTopic", JSON.stringify(datadeletetopic)).then(function (response) {
                                            self.ShowComments();
                                        });
                                    }
                                }));
                            }

                            let datepost = buttonscommentcont.Add(new mobiwork({
                                text: FormatDate(response[i].dateentered),
                                class: "date-entered",
                            }));

                            replycontainer[i] = containerbotleft.Add(new mobiwork.Container({ class: "reply-container" }));

                            for (let ii = 0; ii < response.length; ii++) {
                                if (response[i]._id === response[ii].topicid) {
                                    if (response[ii].deleted === undefined)
                                        response[ii].deleted = 0;

                                    if (response[ii].deleted !== 1) {
                                        replycontainer[i].Add(new mobiwork({ icon: "account", class: "userimage-comment" }));

                                        if (response[ii].text === undefined)
                                            response[ii].text = " ";

                                        let textcontent_ = [];
                                        let datasplit_ = response[ii].text.split(" ");

                                        for (let x = 0; x < datasplit_.length; x++) {
                                            if (datasplit_[x].includes("https://")) {
                                                textcontent_.push("<a href=" + datasplit_[x] + " target='_blank'>" + datasplit_[x] + "</a>");
                                            } else {
                                                textcontent_.push(datasplit_[x]);
                                            }

                                            if (x === datasplit_.length - 1) {
                                                finaltext2 = textcontent_.join(" ");
                                            }
                                        }

                                        replycontainer[i].Add(new mobiwork.List({
                                            text: "<b>" + response[ii].name + "</b><br>" + finaltext2,
                                            // text: "<b>" + response[ii].name + "</b><br>" + response[ii].text,
                                            class: "discussion-reply"
                                        }));

                                        let replycommentcont = replycontainer[i].Add(new mobiwork.Container({ class: "reply-comment-container" }));

                                        if (response[ii].userid === $ACCOUNT.userid) {
                                            let deletereplybutton = replycommentcont.Add(new mobiwork({
                                                text: "Delete",
                                                class: "delete-button",
                                                data: { data: response[ii], index: ii },
                                                onclick: function (data) {
                                                    let datadeletereply = data.data;
                                                    mobiwork.POST($API + "discussion/DeleteMainTopic", JSON.stringify(datadeletereply)).then(function (response) {
                                                        self.ShowComments();
                                                    });
                                                }
                                            }));
                                        }

                                        let replydatepost = replycommentcont.Add(new mobiwork({
                                            text: FormatDate(response[ii].dateentered),
                                            class: "date-entered",
                                        }));
                                    }
                                }
                            }
                        }
                    }
                }
                containerbotleft.Refresh();
            } else {
                containerbotleft.Add(new mobiwork.Header({ text: "No comments in this module." }));
                containerbotleft.Refresh();
            }
        });

        if (parent)
            containerbotleft.Show(parent);
        else
            splittercomment.Set(0, containerbotleft);
    };

    this.ShowAddNewTopic = function (parent) {
        containerbotright = new mobiwork.Container({ class: "comment-container-bot-right" });
        let newposttext;

        newposttext = containerbotright.Add(new mobiwork.InputTextArea({ placeholder: "Post your topic here!", value: "" }));
        containerbotright.Add(new mobiwork.Button({
            icon: "send",
            text: "Post",
            class: "post",
            onclick: function () {
                let insertdata = { userid: $ACCOUNT.userid, name: $ACCOUNT.user.name, username: $ACCOUNT.user.email, moduleid: moduleid, moduletitle: $MODTITLE, type: "topic", text: newposttext.value, coursetitle: coursetitle }

                mobiwork.POST($API + "discussion/InsertNewTopic", JSON.stringify(insertdata)).then(function (response) {
                    if (response === true) {
                        self.ShowComments();
                    } else {
                        containerbotright.Add(new mobiwork.Header({ text: "No comments in this module." }));
                        self.ShowComments();
                    }
                });
            }
        }));

        if (parent)
            containerbotright.Show(parent);
        else
            splittercomment.Set(1, containerbotright);
    };

    this.ShowReference = function (parent) {
        let scontainer = new mobiwork.ScrollContainer();
        let refcont;
        let reflist;
        let query = { moduleid: moduleid };
        mobiwork.POST($API + "references/GetByModuleId", JSON.stringify(query)).then(function (response) {
            refcont = scontainer.Add(new mobiwork.ScrollContainer({ class: " reference-student" }));

            if (response) {
                for (let i = 0; i < response.length; i++) {
                    reflist = refcont.Add(new mobiwork.List({
                        text: response[i].title,
                        icon: "open-in-new",
                        class: "reference-list",
                        onclick: function () {
                            if (response[i].url) {
                                window.open(response[i].url);
                            }
                        }
                    }));
                }

            }
            else {
                reflist = refcont.Add(new mobiwork.List({
                    text: "There are no references",
                    icon: "",
                    class: "reference-list"
                }));
            }
            tab.Set(2, scontainer);
        });
        if (parent)
            scontainer.Show(parent);
        else
            tab.Set(2, scontainer);
    };

    this.UploadImage = function (files, object, field) {
        // if (model._id.value) {
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);

        reader.onloadend = function () {
            var base64data = reader.result;
            object.src = base64data;
            object.Refresh();

            // model.medicalrecord.src = base64data;
            // model.medicalrecord.object.removeClass("image-empty");

            let spinner = new mobiwork.Spinner();
            spinner.Show();

            // let options = { _id: model._id.value, field: field };
            // $ACCOUNT.AddCredentials(options);

            mobiwork.UploadFile({
                url: $API + "courses/Upload",
                name: field,
                files: files,
                options: options,
                onsuccess: function (data) {
                    spinner.Dispose();
                },
                onerror: function (error) {
                    spinner.Dispose();
                }
            });
        }

        // } else {
        //     let message = new mobiwork.MessageBox({
        //         text: "Error",
        //         message: "Please press Save button first before uploading documents.",
        //         showcancel: false
        //     });

        //     message.Show();
        // }
    };

    this.GetModuleIDLog = function (moduleid) {
        let datalog = { userid: $ACCOUNT.user._id, moduleid: moduleid };
        mobiwork.POST($API + "userpresentationlog/GetByUserModuleID", JSON.stringify(datalog)).then(function (responselog) {
            if (responselog.length !== 0) {
                listdatapresentationlog = responselog;
                self.RefreshPresentationList();
            } else {
                let pushitems_;

                let _data_ = { moduleid: moduleid };
                mobiwork.POST($API + "presentation/Get", JSON.stringify(_data_)).then(function (response) {
                    if (response) {
                        response.sort(function (a, b) {
                            _a = parseInt(a.order);
                            _b = parseInt(b.order);

                            if (_a > _b)
                                return 1;
                            else if (_a < _b)
                                return -1;
                            else
                                return 0;
                        });

                        pushitems_ = { userid: $ACCOUNT.user._id, moduleid: moduleid, presentationid: response[0]._id, complete: 1 };

                        mobiwork.POST($API + "userpresentationlog/Insert", JSON.stringify(pushitems_)).then(function (response_) {
                            if (response_) {
                                self.GetModuleIDLog(moduleid);
                            }
                        });
                    }
                });
            }
        });
    };
};