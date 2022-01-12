
// AIT Student
var contentview = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let coursetitle = course[0].title.value;
    let viewparent;
    let tablecontainer;
    let splitrightcontainer;
    let tab;
    let readonly = false;
    let moduleid;
    // let moduletitle = param.dataobject.title;
    let moduletitle;
    let courseiddata;
    let adminsplittercomment;
    let presentationdata;
    let prestype;

    let _desc;
    var splitter;

    let containertop;
    let containerbot;

    let allpresentationorder;

    let _vidtit;
    let _vidtlength;
    let _vidurl;

    let _presorder;

    let _slidetit;
    let _slength;

    let _reftit;
    let _reflink;
    let _file;
    let _originalname;

    //zin Quiz
    let _quiztitle;
    let _quizques;
    let _quiztimer;

    if (param) {
        if (param.model)
            model = param.model;

        if (param.children)
            course = param.children;

        if (param.readonly)
            readonly = param.readonly;

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

            if (param.description) {
                _desc = param.description;
                $MODDESC = _desc;
            }
        }
    }

    this.Show = function (parent) {
        if (parent) {
            viewparent = parent;
            viewparent.Clear();
        }

        if (viewparent.courseiddata)
            courseiddata = viewparent.courseiddata;

        let back = new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                // let homepage = new courseview();
                // homepage.Show(viewparent);
                let homepage = new courseview();
                homepage.Show(viewparent);
                // viewparent.data = courseiddata
                homepage.ShowModules(courseiddata);
            }
        });

        tablecontainer = new mobiwork.SplitContainer({
            gap: 1,
            class: "contentview",
            children: [{ size: 450 }]
        });

        tablecontainer.Show(parent);
        back.Show(parent);

        self.ShowLeftPanel();
        self.ShowRightPanel();
    };

    this.ShowLeftPanel = function (parent) {
        let container = new mobiwork.ScrollContainer();
        container.class += " presentation-list-container";

        let buttoncontainer = container.Add(new mobiwork.Container({ class: "button-container" }));
        buttoncontainer.Add(new mobiwork.Button({
            text: "Add Content",
            class: "button-addcontent",
            icon: "plus",
            onclick: function () {
                let form = new mobiwork.Form({
                    text: "Add Content",
                    width: 500,
                    height: 500,
                    showfooter: false
                });
                form.class += "contentview-form";

                let thumbnail = form.Add(new mobiwork.ThumbnailContainer());
                let contentthumb;

                contentthumb = thumbnail.Add(new mobiwork.Container({ class: "content-thumbnail-container" }));
                contentthumb.Add(new mobiwork.List({ icon: "video", class: "content-thumbnail-icon" }));
                contentthumb.Add(new mobiwork.Button({
                    text: "Video",
                    class: "button-addcontent",
                    onclick: function () {
                        prestype = "video";
                        if (presentationdata)
                            presentationdata = undefined;

                        self.ShowTopPanel();
                        self.ShowBotPanel();

                        form.Dispose();
                    }
                }));

                contentthumb = thumbnail.Add(new mobiwork.Container({ class: "content-thumbnail-container" }));
                contentthumb.Add(new mobiwork.List({ icon: "image", class: "content-thumbnail-icon" }));
                contentthumb.Add(new mobiwork.Button({
                    text: "Slide",
                    class: "button-addcontent",
                    onclick: function () {
                        prestype = "slide";
                        if (presentationdata)
                            presentationdata = undefined;

                        self.ShowTopPanel();
                        form.Dispose();
                    }
                }));

                contentthumb = thumbnail.Add(new mobiwork.Container({ class: "content-thumbnail-container" }));
                contentthumb.Add(new mobiwork.List({ icon: "file-document-outline", class: "content-thumbnail-icon" }));
                contentthumb.Add(new mobiwork.Button({
                    text: "Tools",
                    class: "button-addcontent",
                    onclick: function () {
                        prestype = "reference";
                        if (presentationdata)
                            presentationdata = undefined;

                        self.ShowRightPanel();
                        form.Dispose();
                    }
                }));

                contentthumb = thumbnail.Add(new mobiwork.Container({ class: "content-thumbnail-container" }));
                contentthumb.Add(new mobiwork.List({ icon: "format-list-checks", class: "content-thumbnail-icon" }));
                contentthumb.Add(new mobiwork.Button({
                    text: " Quiz",
                    class: "button-addcontent",
                    onclick: function () {
                        prestype = "quiz";
                        // self.ShowAddData();
                        self.ShowTopPanel();
                        form.Dispose();
                    }
                }));

                form.Show();
            }
        }));

        let data = { userid: $ACCOUNT.user._id, moduleid: moduleid };

        mobiwork.POST($API + "presentation/Get", JSON.stringify(data)).then(function (response) {
            allpresentationorder = response;
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
                container.Add(new mobiwork.List({
                    text: response[i].title,
                    data: response[i],
                    onclick: function (data) {
                        presentationdata = data.data;
                        self.ShowTopPanel();
                        self.ShowBotPanel();
                    },
                    tools: [
                        new mobiwork({
                            text: response[i].order
                        })
                    ]
                }));
            }

            if (parent)
                container.Show(tablecontainer);
            else
                tablecontainer.Set(0, container);
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
        // containertop = new mobiwork.ScrollContainer({ class: "content-container-top" });
        containertop = new mobiwork.ScrollContainer({ class: "content-container-top" });
        containertop.Add(new mobiwork.Header({ text: $MODTITLE }));
        containertop.Add(new mobiwork.Image({ src: $PUBLIC + "/images/mbanner.jpg", class: " banner" }));

        if (presentationdata || prestype) {
            containertop.Clear();
            let type_;

            if (presentationdata)
                type_ = presentationdata.type;
            else
                type_ = prestype

            switch (type_) {
                case "video":
                    self.ShowVideoAdmin();
                    break;
                case "slide":
                    self.ShowSlideAdmin();
                    break;
                case "exercise":
                    containertop.Add(new mobiwork.Header({ text: "exercise" }));
                    break;
                case "quiz":
                    // containertop.Add(new mobiwork.Header({ text: "quiz" }));

                    //zin comment March 3
                    //let adminquizview = new quizview(presentationdata);
                    //adminquizview.Show(viewparent);
                    //
                    self.ShowQuizAdmin();
                    break;
                case "reference":
                    self.ShowReferenceAdmin();
                    break;
            }
        }
        // else {

        //     let courseimage = containertop.Add(new mobiwork.Image({
        //         class: "course-image",
        //         onclick: function (object) {
        //             mobiwork.OpenFile(function (file) {
        //                 self.UploadImage([file], object, "image");
        //             });
        //         },
        //         ondrop: function (files, object) {
        //             self.UploadImage(files, object, "image");
        //         }
        //     }));
        // }

        if (parent)
            containertop.Show(parent);
        else
            splitrightcontainer.Set(0, containertop);

    };

    this.ShowVideoAdmin = function (parent) {
        let model = new videomodel();

        if (containertop)
            containertop.Clear();

        if (!prestype) {
            let ytinfocontainer = containertop.Add(new mobiwork.Container({ class: "ytinfocontainer" }));
            _vidtit = ytinfocontainer.Add(model.vidtit);
            _vidtit.value = presentationdata.title;
            _vidtlength = ytinfocontainer.Add(model.vidlength);
            _vidtlength.value = presentationdata.length;
            _vidurl = ytinfocontainer.Add(model.vidurl);
            _vidurl.value = presentationdata.url;
            _presorder = ytinfocontainer.Add(model.order);
            _presorder.value = presentationdata.order;

            let ytcontainer = containertop.Add(new mobiwork.YoutubeContainer({
                src: presentationdata.url,
                class: "ytcontainer"
            }));
        } else {
            _vidtit = containertop.Add(model.vidtit);
            _vidtlength = containertop.Add(model.vidlength);
            _vidurl = containertop.Add(model.vidurl);
            _presorder = containertop.Add(model.order);
        }
    };

    this.ShowReferenceAdmin = function (parent) {
        let model = new referencemodel();


        if (containertop)
            containertop.Clear();


        if (!prestype) {
            _reftit = containertop.Add(model.reftit);
            _reftit.value = presentationdata.title;
            _presorder = containertop.Add(model.rorder);
            _presorder.value = presentationdata.order;
            _reflink = containertop.Add(model.reflink);

            _file = containertop.Add(new mobiwork.File({
                class: "course-file",
                src: this.file,
                onclick: function (object) {
                    mobiwork.OpenFile(function (file) {

                        self.UploadReference([file], object, "file");
                    });
                },
                ondrop: function (files, object) {

                    mobiwork.OpenFile(function (file) {

                        self.UploadReference(file, object, "file");
                    });

                }

            }));

            if (presentationdata.file) {

                _reflink.value = presentationdata.originalname;
                _reflink.readonly = true;


            }

            else {
                _reflink.value = "No Attachment";
                _reflink.readonly = true;
            }

        } else {
            _reftit = containertop.Add(model.reftit);
            _presorder = containertop.Add(model.rorder);
            _file = containertop.Add(new mobiwork.File({
                class: "course-file",
                src: this.file,
                onclick: function (object) {
                    mobiwork.OpenFile(function (file) {

                        self.UploadReference([file], object, "file");
                    });
                },
                ondrop: function (files, object) {

                    mobiwork.OpenFile(function (file) {

                        self.UploadReference(file, object, "file");
                    });

                }

            }));


        }






    }

    //zin
    this.ShowSlideAdmin = function (parent) {
        let model = new slidemodel();

        if (containertop)
            containertop.Clear();

        if (!prestype) {

            let slidecontainer = containertop.Add(new mobiwork.Container({ class: "slidecontainer" }));
            _slidetit = slidecontainer.Add(model.slidetit);
            _slidetit.value = presentationdata.title;
            _slength = slidecontainer.Add(model.slength);
            _slength.value = presentationdata.length;
            _presorder = slidecontainer.Add(model.sorder);
            _presorder.value = presentationdata.order;



        } else {
            _slidetit = containertop.Add(model.slidetit);
            _slength = containertop.Add(model.slength);
            _presorder = containertop.Add(model.sorder);
        }

        let btntoolbar = containertop.Add(new mobiwork.Toolbar({ class: "button-container-tab" }));
        btntoolbar.Add(new mobiwork.Button({
            text: "Manage Slides",
            class: "button-addcontent",
            icon: "pencil",
            onclick: function () {
                let adminpresentation = new adminpresentationview(presentationdata);
                viewparent.courseiddata = courseiddata;
                adminpresentation.Show(viewparent);
            }

        }));

    };

    this.ShowQuizAdmin = function (parent) {
        let qmodel = new quizmodel();

        if (containertop)
            containertop.Clear();

        if (!prestype) {

            let slidecontainer = containertop.Add(new mobiwork.Container({ class: "slidecontainer" }));
            _quiztitle = slidecontainer.Add(qmodel.quiztitle);
            _quiztitle.value = presentationdata.title;
            _quizques = slidecontainer.Add(qmodel.quizques);
            _quizques.value = presentationdata.noofquestion;
            _presorder = slidecontainer.Add(qmodel.qorder);
            _presorder.value = presentationdata.order;
            _quiztimer = slidecontainer.Add(qmodel.qtimer);
            _quiztimer.value = presentationdata.length;


        } else {

            _quiztitle = containertop.Add(qmodel.quiztitle);
            _quizques = containertop.Add(qmodel.quizques);
            _quiztimer = containertop.Add(qmodel.qtimer);
            _presorder = containertop.Add(qmodel.qorder);

        }
        let buttoncontainer = containertop.Add(new mobiwork.Container({ class: "button-container-tab" }));
        buttoncontainer.Add(new mobiwork.Button({
            text: "Manage Quiz",
            class: "button-addcontent",
            icon: "pencil",
            onclick: function () {
                let qview = new quizview(presentationdata);
                viewparent.courseiddata = courseiddata;
                qview.Show(viewparent);
            }

        }));

    };
    //

    // this.ShowSlideAdmin = function (parent) {
    //     let current = 1;
    //     containertop.Add(new mobiwork.PresentationViewer({
    //         count: parseInt(presentationdata.length),
    //         filename: presentationdata.slide,
    //         current: current,
    //         src: $PUBLIC + "/presentation/" + presentationdata.moduletitle + "/" + presentationdata._id,
    //     }));
    // };

    this.ShowBotPanel = function (parent) {
        containerbot = new mobiwork.Container();
        tab = containerbot.Add(new mobiwork.Tab({
            // class: model.submitted ? "form-readonly" : "form-editable",
            children: [
                { icon: "book-open", text: "Overview" },
                { icon: "comment-text-outline", text: "Discussions" },
                { icon: "view-comfy", text: "References" }

            ]
        }));

        if (parent)
            containerbot.Show(parent);
        else
            splitrightcontainer.Set(1, containerbot);

        self.ShowOverview();
        self.ShowDiscussion();
        self.ShowToolRef();
    };

    this.ShowOverview = function (parent) {
        let scontainer = new mobiwork.ScrollContainer();

        let btntoolbar = scontainer.Add(new mobiwork.Toolbar({ class: "button-container-tab" }));
        // let buttoncontainer = scontainer.Add(new mobiwork.Toolbar({ class: "button-container" }));
        btntoolbar.Add(new mobiwork.Button({
            text: "Save",
            icon: "content-save-outline",
            class: "button-save",
            onclick: function (data) {
                let items = [];
                let value = overview.value;

                if (presentationdata) {
                    switch (presentationdata.type) {
                        case "video":
                            items.push({
                                title: _vidtit.value,
                                length: _vidtlength.value,
                                url: _vidurl.value,
                                moduleid: moduleid,
                                _id: presentationdata._id,
                                overview: value,
                                order: _presorder.value,
                                type: "video"
                            });
                            break;

                        case "slide":
                            items.push({
                                title: _slidetit.value,
                                length: _slength.value,
                                moduleid: moduleid,
                                _id: presentationdata._id,
                                order: _presorder.value,
                                overview: value,
                                type: "slide"
                            });
                            break;

                        //zin
                        case "quiz":
                            items.push({
                                title: _quiztitle.value,
                                length: _quiztimer.value,
                                moduleid: moduleid,
                                noofquestion: _quizques.value,
                                _id: presentationdata._id,
                                order: _presorder.value,
                                overview: value,
                                type: "quiz"
                            });
                            break;

                        case "reference":
                            items.push({
                                title: _reftit.value,
                                moduleid: moduleid,
                                _id: presentationdata._id,
                                url: _reflink.value,
                                order: _presorder.value,
                                file: _file.name,
                                originalname: _file.originalname,
                                type: "reference"
                            });
                            break;
                    }

                    if (_presorder.value === presentationdata.order) {
                        self.SaveData(items);
                    } else {
                        self.CheckOrder(items);
                    }
                } else {
                    switch (prestype) {
                        case "video":
                            items.push({
                                title: _vidtit.value,
                                length: _vidtlength.value,
                                url: _vidurl.value,
                                moduleid: moduleid,
                                overview: value,
                                order: _presorder.value,
                                type: prestype //"video"
                            });
                            break;
                        case "slide":
                            items.push({
                                title: _slidetit.value,
                                length: _slength.value,
                                moduleid: moduleid,
                                order: _presorder.value,
                                overview: value,
                                type: prestype
                            });
                            break;

                        //zin March 12
                        case "quiz":
                            items.push({
                                title: _quiztitle.value,
                                length: _quiztimer.value,
                                moduleid: moduleid,
                                noofquestion: _quizques.value,
                                order: _presorder.value,
                                overview: value,
                                type: prestype
                            });
                            break;

                        case "reference":
                            items.push({
                                title: _reftit.value,
                                moduleid: moduleid,
                                // url: _reflink.value,
                                order: _presorder.value,
                                // file: _file.name,
                                // originalname: _file.originalname,
                                type: prestype
                            });
                            break;

                    }
                    self.CheckOrder(items);
                }
            }
        }));

        //zin
        // let delbuttoncontainer = scontainer.Add(new mobiwork.Container({ class: "button-container" }));
        btntoolbar.Add(new mobiwork.Button({
            text: "Delete",
            icon: "trash-can-outline",
            class: "button-delete",
            data: presentationdata,

            onclick: function (data) {
                let message = new mobiwork.MessageBox({
                    text: "Confirmation",
                    message: "Would you like to delete this record?",
                    showcancel: true,
                    onok: function () {

                        switch (presentationdata.type) {
                            case "video":
                                mobiwork.POST($API + "presentation/DeleteDetails", JSON.stringify(data.data)).then(function (response) {
                                    if (response) {

                                        let message = new mobiwork.MessageBox({
                                            text: "Delete Record",
                                            message: "This video has been deleted!",
                                            showcancel: false
                                        });

                                        message.Show();
                                        presentationdata = undefined;
                                        containertop.Clear();
                                        self.ShowLeftPanel(parent);

                                    }
                                    else {
                                        let message = new mobiwork.MessageBox({
                                            text: "Error",
                                            message: "Unable to delete data.",
                                            showcancel: false
                                        });

                                        message.Show();
                                    }

                                });
                                break;

                            case "slide":
                                mobiwork.POST($API + "presentation/DeleteDetails", JSON.stringify(data.data)).then(function (response) {
                                    if (response) {

                                        mobiwork.POST($API + "slide/GetByPresentationId", JSON.stringify(data.data)).then(function (response) {

                                            if (response.length > 0) {

                                                mobiwork.POST($API + "slide/DeleteDetailsbyPresentationId", JSON.stringify(data.data)).then(function (response) {
                                                    if (response) {

                                                        let message = new mobiwork.MessageBox({
                                                            text: "Delete Record",
                                                            message: "This slide and all its contents has been deleted!",
                                                            showcancel: false
                                                        });

                                                        message.Show();
                                                        presentationdata = undefined;
                                                        containertop.Clear();
                                                        self.ShowLeftPanel(parent);

                                                    }
                                                    else {
                                                        let message = new mobiwork.MessageBox({
                                                            text: "Error",
                                                            message: "Unable to delete data.",
                                                            showcancel: false
                                                        });

                                                        message.Show();
                                                    }

                                                });

                                            }
                                            else {

                                                let message = new mobiwork.MessageBox({
                                                    text: "Delete Record",
                                                    message: "The slide has been deleted!",
                                                    showcancel: false
                                                });

                                                message.Show();
                                                presentationdata = undefined;
                                                containertop.Clear();
                                                self.ShowLeftPanel(parent);
                                            }

                                        });
                                    }

                                });
                                break;

                            //March 18
                            case "quiz":
                                mobiwork.POST($API + "presentation/DeleteDetails", JSON.stringify(data.data)).then(function (response) {
                                    if (response) {

                                        mobiwork.POST($API + "quiz/GetByPresentationIdforDelete", JSON.stringify(data.data)).then(function (response) {

                                            if (response.length > 0) {

                                                mobiwork.POST($API + "quiz/DeleteDetailsbyPresentationId", JSON.stringify(data.data)).then(function (response) {
                                                    if (response) {

                                                        let message = new mobiwork.MessageBox({
                                                            text: "Delete Record",
                                                            message: "This quiz and all its contents have been deleted!",
                                                            showcancel: false
                                                        });

                                                        message.Show();
                                                        presentationdata = undefined;
                                                        containertop.Clear();
                                                        self.ShowLeftPanel(parent);

                                                    }
                                                    else {
                                                        let message = new mobiwork.MessageBox({
                                                            text: "Error",
                                                            message: "Unable to delete data.",
                                                            showcancel: false
                                                        });

                                                        message.Show();
                                                    }

                                                });

                                            }
                                            else {

                                                let message = new mobiwork.MessageBox({
                                                    text: "Delete Record",
                                                    message: "The slide has been deleted!",
                                                    showcancel: false
                                                });

                                                message.Show();
                                                presentationdata = undefined;
                                                containertop.Clear();
                                                self.ShowLeftPanel(parent);
                                            }

                                        });
                                    }

                                });
                                break;

                            case "reference":
                                mobiwork.POST($API + "presentation/DeleteDetails", JSON.stringify(data.data)).then(function (response) {
                                    if (response) {

                                        let message = new mobiwork.MessageBox({
                                            text: "Delete Record",
                                            message: "This reference has been deleted!",
                                            showcancel: false
                                        });

                                        message.Show();
                                        presentationdata = undefined;
                                        containertop.Clear();
                                        self.ShowLeftPanel(parent);

                                    }
                                    else {
                                        let message = new mobiwork.MessageBox({
                                            text: "Error",
                                            message: "Unable to delete data.",
                                            showcancel: false
                                        });

                                        message.Show();
                                    }

                                });
                                break;
                        }
                    }
                });
                message.Show();


            }
        }));

        if ($MODDESC) {
            _desc = $MODDESC;

            overview = scontainer.Add(new mobiwork.Text({ text: _desc, readonly: true, class: "overview-content" }));

        } else {
            overview = scontainer.Add(new mobiwork.InputTextArea({ placeholder: "Add overview of the video", visible: false }));
        }

        if (parent)
            scontainer.Show(parent);
        else
            tab.Set(0, scontainer);

        // let value = temp.GetValue();
    };

    this.ShowDiscussion = function (parent) {
        let scontainer = new mobiwork.ScrollContainer();
        adminsplittercomment = scontainer.Add(new mobiwork.SplitContainer({
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
            adminsplittercomment.Set(0, containerbotleft);
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
            adminsplittercomment.Set(1, containerbotright);
    };

    this.ShowToolRef = function (parent) {
        let scontainer = new mobiwork.ScrollContainer();
        let btntoolbar = scontainer.Add(new mobiwork.Toolbar({ class: "button-container-tab" }));
        let w = 500;
        let h = window.innerHeight * 0.35;
        btntoolbar.Add(new mobiwork.Button({
            icon: "plus",
            text: "Add Reference",
            class: "button-addcontent",
            onclick: function () {

                let form = new mobiwork.Form({
                    text: "Add Reference",
                    height: h,
                    width: w,
                    onok: function () {
                        let items = [];
                        items.push({
                            moduleid: moduleid,
                            title: _linktit.value,
                            url: _url.value
                        })
                        mobiwork.POST($API + "references/Insert", JSON.stringify(items[0])).then(function (response) {
                            if (response) {
                                let message = new mobiwork.MessageBox({
                                    text: "Message",
                                    message: "Saved!",
                                    showcancel: false

                                });
                                self.ShowToolRef(parent);
                                message.Show();
                            }
                        });
                    }
                })
                let model = new linkmodel();
                let _linktit = form.Add(model.linktit);
                let _url = form.Add(model.url);
                form.Show();
            }
        }));

        let refcont;
        let reflist;
        let query = { moduleid: moduleid };
        mobiwork.POST($API + "references/GetByModuleId", JSON.stringify(query)).then(function (response) {
            refcont = scontainer.Add(new mobiwork.ScrollContainer({ class: " reference" }));

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
                    let toolbaredit = new mobiwork.ToolbarButton({
                        class: "edit-glossary", icon: "pencil", text: "", onclick: function () {
                            editform = new mobiwork.Form({
                                text: "Edit Reference",
                                width: w,
                                height: h,
                                showfooter: true,
                                onok: function () {
                                    let items = [];
                                    items.push({
                                        _id: response[i]._id,
                                        title: _linktit.value,
                                        url: _url.value,

                                    });

                                    mobiwork.POST($API + "references/Insert", JSON.stringify(items[0])).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Message",
                                                message: "The record has been updated!",
                                                showcancel: false

                                            });

                                            self.ShowToolRef(parent);
                                            message.Show();

                                        }
                                    });
                                }

                            });

                            let model = new linkmodel();
                            let _linktit = editform.Add(model.linktit);
                            let _url = editform.Add(model.url);

                            let query = { _id: response[i]._id }
                            mobiwork.POST($API + "references/GetById", JSON.stringify(query)).then(function (response) {
                                if (response) {
                                    _linktit.value = editform.Add(response[0].title);
                                    if (response[0].url) {
                                        _url.value = editform.Add(response[0].url);

                                    }
                                    else {
                                        _answer.value = editform.Add(" ");
                                    }

                                }
                                else {
                                    let message = new mobiwork.MessageBox({
                                        text: "Error",
                                        message: "Unable to update data.",
                                        showcancel: false
                                    });

                                    message.Show();
                                }
                                editform.Show();
                            });

                        }
                    });

                    let toolbardel = new mobiwork.ToolbarButton({
                        class: "delete-glossary", icon: "trash-can-outline", text: "",
                        onclick: function () {
                            let message = new mobiwork.MessageBox({
                                text: "Confirmation",
                                message: "Would you like to delete this record?",
                                showcancel: true,
                                onok: function () {

                                    let query = { _id: response[i]._id }
                                    mobiwork.POST($API + "references/Delete", JSON.stringify(query)).then(function (response) {
                                        if (response) {

                                            let message = new mobiwork.MessageBox({
                                                text: "Delete Record",
                                                message: "This record has been deleted!",
                                                showcancel: false
                                            });

                                            self.ShowToolRef(parent);
                                            message.Show();


                                        } else {
                                            let message = new mobiwork.MessageBox({
                                                text: "Error",
                                                message: "Unable to delete data.",
                                                showcancel: false
                                            });

                                            message.Show();
                                        }
                                    });
                                }
                            });
                            message.Show();
                        }
                    });
                    reflist.Add(toolbaredit);
                    reflist.Add(toolbardel);
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

    this.UploadReference = function (files, object, field) {
        // if (model._id.value) {
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);

        reader.onloadend = function () {
            var base64data = reader.result;
            object.src = base64data;
            object.Refresh();

            // model.medicalrecord.src = base64data;
            // model.medicalrecord.object.removeClass("image-empty");

            // let spinner = new mobiwork.Spinner();
            // spinner.Show();
            let options

            if (presentationdata === undefined) {
                let message = new mobiwork.MessageBox({
                    text: "Notify",
                    message: "Please Save first before uploading or attach the file",
                    showcancel: false
                });

                message.Show();

            }
            else {
                options = { _id: presentationdata._id, type: "application/pdf", field: field };
                mobiwork.UploadFile({
                    url: $API + "presentation/UploadReference",
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


            // $ACCOUNT.AddCredentials(options);


        }
    };

    this.CheckOrder = function (data) {
        if (allpresentationorder.length !== 0) {
            for (let i = 0; i < allpresentationorder.length; i++) {
                if (allpresentationorder[i].order !== _presorder.value) {
                    if (i === allpresentationorder.length - 1) {
                        self.SaveData(data);
                    }
                } else {
                    let mes = new mobiwork.MessageBox({
                        text: "Error!",
                        message: "Presentation order already exist!",
                        showcancel: false
                    });

                    mes.Show();
                    break;
                }
            }
        }
        else
            self.SaveData(data);
    };

    this.SaveData = function (data) {
        mobiwork.POST($API + "presentation/Insert", JSON.stringify(data[0])).then(function (response) {
            if (response) {
                let message = new mobiwork.MessageBox({
                    text: "Submitted",
                    message: "Save!",
                    showcancel: false
                });
                prestype = undefined;
                presentationdata = response[0];

                self.ShowLeftPanel();
                self.ShowRightPanel();

                message.Show();

            } else {
                let message = new mobiwork.MessageBox({
                    text: "Error",
                    message: "Unable to save data.",
                    showcancel: false
                });

                presentationdata = data.data[0];

                message.Show();
            }
        });
    };

    this.AddCourse = function () {
        model = new course_model();
        course.push(model);

        self.ShowInformation(viewparent);
    };

    this.EditCourse = function (object) {
        model = object.data;
        self.ShowInformation(viewparent);
    };

    this.Edit = function () {
        model.submitted = false;
        model.Readonly(false);
        self.ShowInformation();
    };
};

this.DocumentContainer = function (container, text, field, icon, addtext, format) {
    //Documents
    let documentcontainer = container.Add(new mobiwork.Container());
    self.ShowDocuments(documentcontainer, field, format);

    if (onedit) {
        container.Add(new mobiwork({
            icon: icon,
            text: addtext,
            onclick: function () {
                self.AddDocument(field, function () {
                    self.ShowDocuments(documentcontainer, field, format);
                });

            }, visible: onedit
        }, "event-add"));
    }
};

this.ShowDocuments = function (container, field, format) {
    container.Clear();
    let listcontainer;

    if (format === "thumbnail")
        listcontainer = container.Add(new mobiwork.ThumbnailContainer());
    else {
        listcontainer = container.Add(new mobiwork.Container());
        listcontainer.class += " document-container";
    }

    if (event[field] && event[field].length) {
        for (let i = 0; i < event[field].length; i++) {
            event[field][i].index = i;
            self.AddDocumentList(container, listcontainer, event[field][i], field, format, i, event[field]);
        }

        container.Refresh();

    } else {
        if (!onedit) {
            let empty = listcontainer.Add(new mobiwork.List({ text: "No " + field + " to display. Click edit button at the toolbar to add " + field + "." }));
            empty.class += " empty-list";

            container.Refresh();
        }
    }

    if (onedit && !mobiwork.mobile) {
        let empty = listcontainer.Add(new mobiwork.List({
            text: "Drop files here.",
            ondrop: function (files) {
                let spinner = new mobiwork.Spinner();
                spinner.Show();

                //For photos only
                let counter = 0;

                if (field === "photos") {
                    for (let i = 0; i < files.length; i++) {
                        if (files[i].type.indexOf("image") === -1) {
                            files[i].skip === true;
                            counter++;
                        }
                    }
                }

                if (counter !== files.length) {
                    self.UploadFiles(files, field, function () {
                        self.ShowDocuments(container, field, format);
                        spinner.Dispose();
                    });
                } else {
                    spinner.Dispose();

                    let message = new mobiwork.MessageBox({
                        text: "Error",
                        icon: "alert-circle",
                        message: "Please upload photos only."
                    });

                    message.Show();
                }
            }
        }));

        empty.class += " empty-list drop-files";

        container.Refresh();
    }
};

this.AddDocumentList = function (parentcontainer, container, data, field, format, index, event) {
    if (format === "thumbnail") {
        let list = container.Add(new mobiwork.Thumbnail({
            data: $PUBLIC + "documents/" + data.filename,
            src: $PUBLIC + "documents/thumbnail_" + data.filename,
            onclick: function (object) {
                let images = [];

                for (let i = 0; i < event.length; i++) {
                    images.push($PUBLIC + "documents/" + event[i].filename);
                }

                let viewer = new mobiwork.PhotoViewer({
                    data: images,
                    current: index
                });

                viewer.Show();
            }
        }));

        if (onedit) {
            list.tools.push(
                new mobiwork({
                    icon: "close-circle",
                    data: { list: list, document: data },
                    onclick: function (object) {
                        self.DeleteDocument(field, field, object.data.document.index, function () {
                            self.ShowDocuments(parentcontainer, field, format);
                        });
                    }
                })
            );
        }

        container.Refresh();

    } else {
        let icon = "file-outline";

        if (data.name.indexOf(".ppt") !== -1)
            icon = "file-powerpoint";

        else if (data.name.indexOf(".doc") !== -1)
            icon = "file-word";

        else if (data.name.indexOf(".xls") !== -1)
            icon = "file-excel";

        else if (data.name.indexOf(".pdf") !== -1)
            icon = "file-pdf";

        else if (data.name.indexOf(".zip") !== -1)
            icon = "zip-box";

        else if (data.name.indexOf(".mp4") !== -1)
            icon = "video";

        let list = container.Add(new mobiwork.List({
            icon: icon,
            text: "<a href='" + $PUBLIC + "documents/" + data.filename + "' target='_blank'>" + data.name + "</a>"
        }));

        list.Add(new mobiwork({ text: dateFormat(new Date(data.date), "dd mmm yyyy") }));

        if (onedit) {
            list.tools.push(
                new mobiwork({
                    icon: "close-circle",
                    data: { list: list, document: data },
                    onclick: function (object) {
                        self.DeleteDocument(field, field, object.data.document.index, function () {
                            self.ShowDocuments(parentcontainer, field, format);
                        });
                    }
                })
            );
        }

        container.Refresh();
    }
};


var videomodel = function () {
    this.vidtit = new mobiwork.InputText({
        text: "Video Title"
    });

    this.vidlength = new mobiwork.InputText({
        text: "Video Length"
    });

    this.vidurl = new mobiwork.InputText({
        text: "Video Url"
    });

    this.order = new mobiwork.InputText({
        text: "Presentation Order"
    });
};

var slidemodel = function () {
    this.slidetit = new mobiwork.InputText({
        text: "Slide Title"
    });

    this.slength = new mobiwork.InputText({
        text: "Number of Slides"
    });

    this.sorder = new mobiwork.InputText({
        text: "Presentation Order"
    });
};

var referencemodel = function () {
    this.reftit = new mobiwork.InputText({
        text: "Title"
    });

    this.reflink = new mobiwork.InputText({
        text: "Attached File"
    });

    this.rorder = new mobiwork.InputText({
        text: "Presentation Order"
    });

};

var linkmodel = function () {
    this.linktit = new mobiwork.InputText({
        text: "Title"
    });

    this.url = new mobiwork.InputText({
        text: "Place Reference URL"
    });
}
//zin Quiz
var quizmodel = function () {

    this.quiztitle = new mobiwork.InputText({
        text: "Quiz Title"
    });

    this.quizques = new mobiwork.InputText({
        text: "No. of Questions"
    });

    this.qanswer = new mobiwork.InputText({
        text: "Quiz Title"
    });

    this.qorder = new mobiwork.InputText({
        text: "Presentation Order"
    });

    this.qtimer = new mobiwork.InputText({
        text: "Quiz Timer"
    });

};
