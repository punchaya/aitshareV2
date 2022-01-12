
var admindiscussionview = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let viewparent;
    let tablecontainer;
    let readonly = false;
    let splittercomment;

    let selectedcourse = param;
    let containerright;
    let containerbotright

    let selectedCID;
    let selectedM;
    let moduletitle;
    let coursetitle = course[0].title.value;

    if (param) {
        if (param.model)
            model = param.model;

        if (param.children)
            course = param.children;

        if (param.readonly)
            readonly = param.readonly;
    }

    this.Show = function (parent) {
        if (parent) {
            viewparent = parent;
            viewparent.Clear();
        }

        let back = new mobiwork({
            class: "back-icon", icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new courseview();
                homepage.Show(viewparent);
                homepage.ShowModules(selectedcourse);
            }
        });

        tablecontainer = new mobiwork.SplitContainer({
            gap: 1,
            class: "contentview",
            children: [{ size: 400 }]
        });

        tablecontainer.Show(parent);
        back.Show(parent);

        // self.ShowCourses();
        self.ShowLeftPanel();
        self.ShowRightPanel();
    };

    this.ShowLeftPanel = function (parent) {
        let container = new mobiwork.ScrollContainer({ class: "dis-container-left" });

        let thumbnailmodule = container.Add(new mobiwork.ThumbnailContainer());
        let modulethumb;

        let prevselected;

        thumbnailmodule.Add(new mobiwork.List({
            // icon: $PUBLIC + "/images/mbanner.jpg",
            text: "⚠️⚠️  OPEN FORUM  ⚠️⚠️",
            // data: response[i],
            class: "open-forum-discussion",
            onclick: function () {
                selectedM = undefined;
                selectedCID = param.data._id.value;
                // moduletitle = data.data.title;
                self.ShowRightPanel()
            }
        }));

        let data = { courseid: param.data._id.value };

        mobiwork.POST($API + "modules/Get", JSON.stringify(data)).then(function (response) {
            if (response) {
                for (let i = 0; i < response.length; i++) {

                    // let modulepercent = { userid: $ACCOUNT.user._id, moduleid: response[i]._id };
                    // mobiwork.POST($API + "userpresentationlog/SummaryLog", JSON.stringify(modulepercent)).then(function (responselog_) {
                    modulethumb = thumbnailmodule.Add(new mobiwork.Container({ class: "course-container-discussion" }));

                    if (response[i].image) {
                        modulethumb.Add(new mobiwork.Thumbnail({
                            icon: $PUBLIC + "/images/" + response[i].image,
                            data: response[i],
                            onclick: function (data) {
                                selectedM = data.data._id;
                                moduletitle = data.data.title;
                                self.ShowRightPanel()
                            }
                        }));
                    } else {
                        modulethumb.Add(new mobiwork.List({
                            icon: $PUBLIC + "/images/mbanner.jpg",
                            text: response[i].title,
                            data: response[i],
                            class: "no-image-container-discussion",
                            onclick: function (data) {
                                if (prevselected !== undefined) {
                                    if (prevselected.object[0].className.includes("selected")) {
                                        prevselected.RemoveClass("selected");
                                        data.object[0].className += " selected";
                                    }
                                }else {
                                    data.object[0].className += " selected";
                                }

                                // data.object[0].className += " highlight";
                                selectedM = data.data._id;
                                moduletitle = data.data.title;

                                prevselected = data;

                                self.ShowRightPanel()
                            }
                        }));
                    }


                    // modulethumb.Add(new mobiwork.List({ text: response[i].title, data: response[i], onclick: self.ShowContentView, class: "module-title" }));


                    // if (responselog_) {
                    //     modulethumb.Add(new mobiwork.ProgressBarRRCAP({ percentage: responselog_ }));
                    // }

                    // tablecontainer.Clear();
                    // titlepanel.Show(tablecontainer);
                    // partnerlogo.Show(tablecontainer);
                    // topmenucpanel.Show(tablecontainer);
                    // modulescontainer.Show(tablecontainer);
                    // // thumbnailmodule.Show(tablecontainer);
                    // back.Show(tablecontainer);
                    // });
                }
                if (parent)
                    container.Show(tablecontainer);
                else
                    tablecontainer.Set(0, container);
            }
        });
    };

    this.ShowRightPanel = function (parent) {
        containerright = new mobiwork.Container();
        splittercomment = containerright.Add(new mobiwork.SplitContainer({
            class: "discussion-splitter",
            children: [{ size: 700 }],
            orientation: ORIENTATION.VERTICAL
        }));

        if (parent)
            containerright.Show(parent);
        else
            tablecontainer.Set(1, containerright);

        self.ShowDiscussion();
        self.ShowAddNewTopicC();
    };

    this.ShowDiscussion = function (parent) {
        containerbotleft = new mobiwork.ScrollContainer({ class: "comment-container-bot-left" });
        let replycontainer = [];
        let replytext;
        let finaltext1;
        let finaltext2;
        let query;

        if (selectedM !== undefined)
            query = { moduleid: selectedM };
        else
            query = { courseid: selectedCID };

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
                                                    let insertcomment;

                                                    if (selectedM !== undefined)
                                                        insertcomment = { userid: $ACCOUNT.userid, name: $ACCOUNT.user.name, username: $ACCOUNT.user.email, moduleid: selectedM, type: "comment", text: replytext.value, topicid: response[i]._id, coursetitle: coursetitle };
                                                    else
                                                        insertcomment = { userid: $ACCOUNT.userid, name: $ACCOUNT.user.name, username: $ACCOUNT.user.email, courseid: selectedCID, type: "comment", text: replytext.value, topicid: response[i]._id, coursetitle: coursetitle };


                                                    mobiwork.POST($API + "discussion/InsertNewComment", JSON.stringify(insertcomment)).then(function (response) {
                                                        if (response === true) {
                                                            self.ShowDiscussion();
                                                        } else {
                                                            containerbotright.Add(new mobiwork.Header({ text: "No comments in this module." }));
                                                            self.ShowDiscussion();
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
                                                let insertcomment;

                                                if (selectedM !== undefined)
                                                    insertcomment = { userid: $ACCOUNT.userid, name: $ACCOUNT.user.name, username: $ACCOUNT.user.email, moduleid: selectedM, type: "comment", text: replytext.value, topicid: response[i]._id, coursetitle: coursetitle };
                                                else
                                                    insertcomment = { userid: $ACCOUNT.userid, name: $ACCOUNT.user.name, username: $ACCOUNT.user.email, courseid: selectedCID, type: "comment", text: replytext.value, topicid: response[i]._id, coursetitle: coursetitle };

                                                mobiwork.POST($API + "discussion/InsertNewComment", JSON.stringify(insertcomment)).then(function (response) {
                                                    if (response === true) {
                                                        self.ShowDiscussion();
                                                    } else {
                                                        containerbotright.Add(new mobiwork.Header({ text: "No comments in this module." }));
                                                        self.ShowDiscussion();
                                                    }
                                                });
                                            }
                                        }));
                                        replycontainer[data.data.index].Refresh();
                                    }
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
                                            self.ShowDiscussion();
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

                                        let textcontent_ = [];

                                        if (response[ii].text === undefined)
                                            response[ii].text = " ";

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
                                                        self.ShowDiscussion();
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

    this.ShowAddNewTopicC = function (parent) {
        containerbotright = new mobiwork.Container({ class: "comment-container-bot-right" });
        let newposttext;

        newposttext = containerbotright.Add(new mobiwork.InputTextArea({ placeholder: "Post your topic here!", value: "" }));
        containerbotright.Add(new mobiwork.Button({
            icon: "send",
            text: "Post",
            class: "post",
            onclick: function () {
                let insertdata;
                if (selectedM !== undefined)
                    insertdata = { userid: $ACCOUNT.userid, name: $ACCOUNT.user.name, username: $ACCOUNT.user.email, moduleid: selectedM, moduletitle: moduletitle, type: "topic", coursetitle: coursetitle, text: newposttext.value }
                else
                    insertdata = { userid: $ACCOUNT.userid, name: $ACCOUNT.user.name, username: $ACCOUNT.user.email, courseid: selectedCID, moduletitle: moduletitle, type: "topic", coursetitle: coursetitle, text: newposttext.value }

                mobiwork.POST($API + "discussion/InsertNewTopic", JSON.stringify(insertdata)).then(function (response) {
                    if (response === true) {
                        self.ShowDiscussion();
                    } else {
                        containerbotright.Add(new mobiwork.Header({ text: "No comments in this module." }));
                        self.ShowDiscussion();
                    }
                });
            }
        }));

        if (parent)
            containerbotright.Show(parent);
        else
            splittercomment.Set(1, containerbotright);
    };
};