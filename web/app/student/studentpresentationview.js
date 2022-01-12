var studentpresentationview = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let viewparent;
    let tablecontainer;
    let splitrightcontainer;
    let readonly = false;
    let presentationid;

    let slidesdata;
    let allslidesdata;
    let slideindex;
    let clog;

    let containerdatatext;
    let containerdataimage;

    let refreshRight = true;

    let containerlistpresentation;

    if (param) {
        if (param.model)
            model = param.model;

        if (param.children)
            course = param.children;

        if (param.readonly)
            readonly = param.readonly;

        if (param._id)
            presentationid = param._id;

        if (param.slideindex)
            slideindex = param.slideindex;

        if (param.clog)
            clog = param.clog;
        else
            clog = false;
    }

    this.Show = function (parent) {
        if (parent) {
            viewparent = parent;
            viewparent.Clear();
        }

        let back = new mobiwork({
            class: "back-icon",
            icon: "mdi-arrow-left",
            onclick: function () {
                let homepage = new studentcontentview(param);
                homepage.Show(viewparent);
            }
        });

        tablecontainer = new mobiwork.SplitContainer({
            gap: 1,
            class: "contentview",
            children: [{ size: 110 }]
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

        self.GetPresentationIDLog(presentationid);
    };

    this.RefreshSlideList = function (parent) {

        containerlistpresentation = new mobiwork.Container({ class: " presentation-list-container" });

        let listslide = containerlistpresentation.Add(new mobiwork.ScrollContainer());

        let slidesitems = [];
        let stype;
        let stopaddcontinue = true;


        let data = { presentationid: presentationid };
        mobiwork.POST($API + "slide/Get", JSON.stringify(data)).then(function (response) {
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

            allslidesdata = response;

            for (let i = 0; i < response.length; i++) {
                slidesitems.push(listslide.Add(new mobiwork.List({
                    class: "outline",
                    icon: "checkbox-blank-outline", //"checkbox-marked",
                    text: i + 1,
                    data: { data: response[i], selectedindex: i },
                    onclick: function (data) {
                        refreshRight = true;

                        slidesdata = data.data.data;
                        slideindex = data.data.selectedindex;

                        if (slidesdata.type !== "Exercise") {
                            if (!data.class.includes("disable")) {
                                if (slidesdata.type === "Presentation")
                                    stype = "slide";
                                else
                                    stype = "exercise";

                                let pushitems_ = { userid: $ACCOUNT.user._id, slideid: slidesdata._id, presentationid: slidesdata.presentationid, complete: 1, type: stype };

                                mobiwork.POST($API + "userslidelog/Insert", JSON.stringify(pushitems_)).then(function (response) {
                                    if (response) {
                                        self.GetPresentationIDLog(presentationid);
                                    }
                                });
                            }
                        } else {
                            $VIEW = viewparent;
                            self.GetPresentationIDLog(presentationid);
                        }
                    }
                })));

                slidesitems[i].class += " disable";

                for (let ii = 0; ii < listdataslidelog.length; ii++) {
                    if (response[i]._id === listdataslidelog[ii].slideid) {
                        if (listdataslidelog[ii].complete === 1) {
                            // slidesitems[i].class += " list outline";
                            slidesitems[i].class = "list outline";
                            slidesitems[i].icon = "checkbox-marked";
                            stopaddcontinue = false;
                        }
                    }
                }

                if (i === listdataslidelog.length) {
                    slidesitems[i].class = "list presentation-items";
                    slidesitems[i].class += " continue";
                    slidesitems[i].icon = "checkbox-blank-outline";
                }
                listslide.Refresh();
            }

            if (parent)
                containerlistpresentation.Show(tablecontainer);
            else
                tablecontainer.Set(0, containerlistpresentation);

            self.ShowRightPanel();
        });
    };

    this.ShowRightPanel = function (parent) {
        if (refreshRight) {
            if (allslidesdata) {
                if (allslidesdata.length !== 0) {
                    let container = new mobiwork.ScrollContainer();
                    let c;
                    if (slidesdata)
                        c = slideindex
                    else if (clog)
                        c = slideindex;
                    else
                        c = 0;


                    container.Add(new mobiwork.PresentationViewerRRCAP({
                        count: parseInt(allslidesdata.length),
                        data: allslidesdata,
                        // filename: slidesdata.slide,
                        counter: c,
                        src: $PUBLIC + "/presentation",
                        changelog: function (data) {
                            clog = true;
                            slideindex = data - 1;
                            refreshRight = true;

                            self.GetPresentationIDLog(presentationid);
                        },
                        onsubmit: function (data) {
                            clog = true;
                            slideindex = data - 1
                            refreshRight = false;

                            self.GetPresentationIDLog(presentationid);

                        }
                    }));

                    if (parent)
                        container.Show(parent);
                    else
                        tablecontainer.Set(1, container);
                } else {
                    let form = new mobiwork.Form({
                        text: "",
                        width: 500,
                        height: 100,
                        showfooter: false
                    });

                    let cont = form.Add(new mobiwork.Container({ class: "information-form" }));
                    cont.Add(new mobiwork({ text: "No Slides Available!" }));

                    form.Show()
                }
            };
        };
    };

    this.ShowDataText = function (parent) {
        containerdatatext = new mobiwork.ScrollContainer({ class: "content-container-top" });
        if (slidesdata) {
            containerdatatext.Clear();
            switch (slidesdata.type) {
                case "video":
                    containerdatatext.Add(new mobiwork.YoutubeContainer({
                        src: slidesdata.url
                    }));
                    break;
                case "slide":
                    let current = 1;
                    containerdatatext.Add(new mobiwork.PresentationViewer({
                        count: parseInt(slidesdata.length),
                        filename: slidesdata.slide,
                        current: current,
                        src: $PUBLIC + "/presentation/" + slidesdata.moduletitle + "/" + slidesdata._id,
                    }));
                    break;
                case "exercise":
                    containerdatatext.Add(new mobiwork.Header({ text: "exercise" }));
                    break;

                case "quiz":
                    containerdatatext.Add(new mobiwork.Header({ text: "quiz" }));
                    break;
            }
        } else {
            if (allslidesdata) {
                let current = 1;
                console.log(allslidesdata);

                containerdatatext.Add(new mobiwork.PresentationViewerRRCAP({
                    count: parseInt(allslidesdata.length),
                    filename: allslidesdata.slide,
                    current: current,
                    src: $PUBLIC + "/presentation/" + allslidesdata.moduletitle + "/" + allslidesdata._id,
                }));
            }

            // let courseimage = containerdatatext.Add(new mobiwork.Image({
            //     class: "course-image",
            //     onclick: function (object) {
            //         mobiwork.OpenFile(function (file) {
            //             self.UploadImage([file], object, "image");
            //         });
            //     },
            //     ondrop: function (files, object) {
            //         self.UploadImage(files, object, "image");
            //     }
            // }));
        }

        if (parent)
            containerdatatext.Show(parent);
        else
            splitrightcontainer.Set(0, containerdatatext);
    };

    this.ShowDataImage = function (parent) {
        containerdataimage = new mobiwork.Container();

        let current = 1;
        containerdataimage.Add(new mobiwork.PresentationViewer({
            count: parseInt(slidesdata.length),
            filename: slidesdata.slide,
            current: current,
            src: $PUBLIC + "/presentation/" + slidesdata.moduletitle + "/" + slidesdata._id,
        }));

        if (parent)
            containerdataimage.Show(parent);
        else
            splitrightcontainer.Set(1, containerdataimage);
    };

    this.GetPresentationIDLog = function (presentationid) {
        let datalog = { userid: $ACCOUNT.user._id, presentationid: presentationid };
        mobiwork.POST($API + "userslidelog/GetByUserPresentationID", JSON.stringify(datalog)).then(function (responselog) {
            if (responselog.length !== 0) {
                listdataslidelog = responselog;

                self.RefreshSlideList();
            } else {
                let stype;
                let pushitems_;

                let _data_ = { presentationid: presentationid };
                mobiwork.POST($API + "slide/Get", JSON.stringify(_data_)).then(function (response) {
                    if (response.length !== 0) {
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

                        if (response[0].type === "Presentation")
                            stype = "slide";
                        else
                            stype = "exercise";

                        pushitems_ = { userid: $ACCOUNT.user._id, slideid: response[0]._id, presentationid: response[0].presentationid, complete: 1, type: stype };

                        mobiwork.POST($API + "userslidelog/Insert", JSON.stringify(pushitems_)).then(function (response_) {
                            if (response_) {
                                self.GetPresentationIDLog(presentationid);
                            }
                        });
                    }
                });
            }
        });
    };
};