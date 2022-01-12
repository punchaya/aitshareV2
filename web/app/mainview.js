var mainview = function () {
    let self = this;
    let view;
    let content;
    let mainsplitter;

    this.Show = function () {
        if ($PHONE)
            self.InitializePhone();
        else
            self.InitializeTablets();

        self.Refresh();
    };

    this.InitializePhone = function () {
        mainsplitter = new mobiwork.SplitContainer({
            class: "main-splitter mini",
            children: [{ size: 0 }]
        });

        mainsplitter.Show();

        self.ShowMenu();
        self.ShowView();
    };

    this.InitializeTablets = function () {
        if (window.innerWidth < 770) {
            mainsplitter = new mobiwork.SplitContainer({
                class: "main-splitter mini",
                children: [{ size: 0 }]
            });
        } else {
            mainsplitter = new mobiwork.SplitContainer({
                class: "main-splitter",
                children: [{ size: 240 }]
            });
        }

        mainsplitter.Show();

        self.ShowMenu();
        self.ShowView();
    };

    this.DownloadData = function (res) {
        let data = { userid: $ACCOUNT.user._id };
        $ACCOUNT.AddCredentials(data);
        let model;
        $COURSE = [];

        if ($ACCOUNT.user.usertype === "admin") {
            mobiwork.POST($API + "courses/Get", JSON.stringify(data)).then(function (response) {
                if (response) {
                    // $COURSE = [];
                    for (let i = 0; i < response.length; i++) {
                        model = new course_model();
                        model.Open(response[i]);

                        $COURSE.push(model);
                    }
                    data = { userid: $ACCOUNT.user._id };
                    $ACCOUNT.AddCredentials(data);
                    res();
                }
            });
        } else {
            mobiwork.POST($API + "courses/GetCoursesByUserId", JSON.stringify(data)).then(function (response) {
                if (response) {
                    // $COURSE = [];
                    for (let i = 0; i < response.length; i++) {

                        model = new studentcourse_model();
                        model.Open(response[i]);
                        $COURSE.push(model);
                    }
                    data = { userid: $ACCOUNT.user._id };
                    $ACCOUNT.AddCredentials(data);
                    res();
                }
            });
            // mobiwork.POST($API + "courses/GetCoursesByUserId", JSON.stringify(data)).then(function (response) {
            //     if (response) {
            //         // $COURSE = [];
            //         for (let i = 0; i < response.length; i++) {
            //             let courseid = { courseid: response[i].courseid };
            //             mobiwork.POST($API + "courses/GetCoursesByCourseId", JSON.stringify(courseid)).then(function (response_course) {
            //                 if (response_course) {
            //                     model = new studentcourse_model();
            //                     model.Open(response_course[i]);
            //                     $COURSE.push(model);

            //                     data = { userid: $ACCOUNT.user._id };
            //                     $ACCOUNT.AddCredentials(data);
            //                     res();
            //                 }

            //             });
            //         }

            //     }
            // });
        }
    };

    // this.DownloadDataForStudent = function (res) {
    //     let data = { userid: $ACCOUNT.user._id };
    //     $ACCOUNT.AddCredentials(data);
    //     let model;

    //     let coursedata = []; //zin Dec17

    //     //zin Dec 17
    //     $COURSE = [];

    // };

    this.Refresh = function () {
        let spinner = new mobiwork.Spinner();
        spinner.Show();

        this.DownloadData(function () {
            if ($ACCOUNT.user.usertype === "admin") {
                self.ShowCourseInfo();
            } else {
                self.ShowCourseInfoStudent();
            }
            spinner.Dispose();
        });
    };

    this.ShowView = function () {
        view = new mobiwork.View({
            text: "eLearning Hub",
            onclick: function () {
                if (mainsplitter.children[0].size === 0) {
                    mainsplitter.object.toggleClass("mini");
                    mainsplitter.children[0].size = 240;
                }
                else {
                    mainsplitter.object.toggleClass("mini");
                    mainsplitter.children[0].size = 0;
                }

                mainsplitter.Resize();
            }
        });
        mainsplitter.Set(1, view);
    };

    this.ShowMenu = function (parent) {
        //Left panel
        let container = new mobiwork.ScrollContainer({ class: "left-panel" });

        let profile = container.Add(new mobiwork.List({ icon: "account", text: $ACCOUNT.user.name, class: "user-profile", onclick: self.AccountInformation }));
        profile.Add(new mobiwork({ text: $ACCOUNT.user.email }));

        let list;
        let headercourse;
        let headercoursebutton;
        let courseprogress;
        let coursegrade;

        container.Add(new mobiwork.Header({ text: "Dashboard" }));

        if ($ACCOUNT.user.usertype === "admin") {
            headercourse = container.Add(new mobiwork.List({
                icon: "apps", text: "My Course",
                highlight: true,
                class: " header_menu",
                onclick: function () {
                    self.ShowCourseInfo();
                }
            }));

            // headercoursebutton = headercourse.Add(new mobiwork.FloatingButton({
            //     icon: "chevron-down",
            //     class: "headercourse_button",
            //     onclick: function () {
            //         if (courseprogress.visible === false) {
            //             courseprogress.visible = true;
            //             coursegrade.visible = true;
            //             headercoursebutton.icon = "chevron-up";
            //         } else {
            //             courseprogress.visible = false;
            //             coursegrade.visible = false;
            //             headercoursebutton.icon = "chevron-down";
            //         }

            //         container.Refresh();
            //     }
            // }));
            // courseprogress = container.Add(new mobiwork.List({ text: "Students", highlight: true, onclick: this.ShowCourseInfo, visible: false, class: " sub_menu" }));

            // container.Add(new mobiwork.List({ icon: "account-group", text: "Students", highlight: true, onclick: this.ShowStudent, visible: true, class: " header_menu" }));

            container.Add(new mobiwork.List({ icon: "account-group", text: "Students", highlight: true, onclick: this.ShowStudentView, visible: true, class: " header_menu" }));
            container.Add(new mobiwork.List({ icon: "book-open-outline", text: "Glossary", highlight: true, visible: true, class: " header_menu", onclick: this.ShowGlossary })); //onclick: this.ShowContentView,

        }

        else {
            // container.Add(new mobiwork.List({
            //     icon: "information", text: "Welcome & Info",
            //     highlight: true,
            //     class: " header_menu",
            //     onclick: function () {
            //         self.ShowCourseInfoStudent();
            //     }
            // }));
            container.Add(new mobiwork.List({
                icon: "apps", text: "My Courses",
                highlight: true,
                class: " header_menu",
                onclick: function () {
                    self.ShowCourseInfoStudent();
                }
            }));
            container.Add(new mobiwork.List({
                icon: "file-certificate", text: "Certificate",
                highlight: true,
                class: " header_menu",
                tools: [
                    new mobiwork({
                        class: "student-medal-icon",
                        icon: "medal-outline"
                    })
                ],
                onclick: self.ShowCertificate
            }));

        }

        container.Add(new mobiwork.Header({ text: "Control Panel" }));
        container.Add(new mobiwork.List({
            icon: "arrow-right-circle",
            text: "About The Hub",
            highlight: true,
            class: " header_menu",
            onclick: this.About
        }));
        container.Add(new mobiwork.List({
            icon: "arrow-right-circle",
            text: "Exit Dashboard",
            highlight: true,
            class: " header_menu",
            onclick: this.Exit
        }));
        container.Add(new mobiwork.List({
            icon: "arrow-right-circle",
            text: "Logout",
            highlight: true,
            class: " header_menu",
            onclick: this.Logout
        }));

        if (parent)
            container.Show(parent);
        else
            mainsplitter.Set(0, container);
    };

    this.ShowCourseInfo = function () {
        view.Clear();
        // content = new mobiwork.Container({ class: "main-container" });
        content = new mobiwork.Container({ class: "content-container", text: "My Courses" });

        view.Add(content);
        view.Refresh();

        let children = view.object.children(".view-body");
        children.addClass("content");

        let student = new courseview();
        student.Show(content);

    };

    this.ShowCourseInfoStudent = function () {
        view.Clear();
        content = new mobiwork.Container({ class: "content-container" });

        view.Add(content);
        view.Refresh();

        let children = view.object.children(".view-body");
        children.addClass("content");

        let student_courseview = new studentcourseview();
        student_courseview.Show(content);
    };

    this.ShowContentView = function () {
        view.Clear();
        content = new mobiwork.Container({ class: "content-container" });
        view.Add(content);
        view.Refresh();

        let children = view.object.children(".view-body");
        children.addClass("content");

        let content_ = new contentview();
        content_.Show(content);
    };

    this.ShowStudentView = function () {
        view.Clear();
        content = new mobiwork.Container({ class: "student-container-admin" });
        view.Add(content);
        view.Refresh();

        let children = view.object.children(".view-body");
        children.addClass("student-list-admin");

        let content_ = new studentview();
        content_.Show(content);
    };

    this.ShowGlossary = function () {
        let w = window.innerWidth * 0.7;
        let h = window.innerHeight * 0.95;
        let form = new mobiwork.Form({
            text: "Glossary",
            height: h,
            width: w,
            showcancel: true,
            showok: true,
            class: "about"

        });

        // let glospanel = new mobiwork.Container({ text: "Glossary" });
        let gloscroll = new mobiwork.ScrollContainer({ class: "glossary-admin" });
        let gloscont;


        mobiwork.POST($API + "glossary/Get", JSON.stringify()).then(function (response) {
            if (response) {

                let term;
                for (let i = 0; i < response.length; i++) {
                    gloscont = gloscroll.Add(new mobiwork.Container({ class: "faq-view" }));
                    term = gloscont.Add(new mobiwork.List({ text: response[i].term, icon: "text-shadow", class: "term" }));
                    // term.Add(new mobiwork.ToolbarButton({icon:"delete"}));
                    gloscont.Add(new mobiwork.Text({ text: response[i].description }));
                }

            }
            gloscroll.Show(form);
        });

        form.Show();


    };

    this.ShowStudent = function () {
        let w = window.innerWidth * 0.7;
        let h = window.innerHeight * 0.95;
        let form = new mobiwork.Form({
            text: "",
            height: h,
            width: w,
            showcancel: true,
            showok: true

        });
        let studentpanel = new mobiwork.Panel({
            icon: new mobiwork.ToolbarButton({
                text: "Add New Student",
                class: " addterm",
                onclick: function () {
                    // self.AddNewFAQ();
                }
            }),
            text: "Students",
            // class: " glossary-mainview"
        });

        let studentscroll = new mobiwork.ScrollContainer({ class: "student" });
        let studentcont;
        let studentlist;
        let studentprogress;
        mobiwork.POST($API + "users/GetStudentList", JSON.stringify()).then(function (response) {
            studentcont = studentscroll.Add(new mobiwork.Container({ class: "faq-view" }));
            if (response) {
                for (let i = 0; i < response.length; i++) {
                    // studentcont.Add(new mobiwork.Grid({
                    //     children: [
                    //         new mobiwork({ text: response[i].name }),
                    //         new mobiwork({ text: response[i].email }),
                    //     ]
                    // }));

                    studentlist = studentcont.Add(new mobiwork.List({
                        text: response[i].name,
                        icon: "account",
                        class: "student-list",
                        onclick: self.ShowStudentView
                    }));
                    // studentlist.Add(new mobiwork.List({
                    //     text: response[i].email,
                    //     icon: "email",
                    //     class: "email"
                    // }));
                    // studentprogress = studentlist.Add(new mobiwork.ProgressBarRRCAP({ percentage: "50"}))
                }
            }
            else {
                studentcont.Add(new mobiwork.List({
                    text: "There are no registered student",
                    icon: "",
                    class: "student-list"
                }));
            }

            studentscroll.Show(form);
        });
        form.Add(studentpanel);
        // form.Add(studentscroll);
        form.Show();
    };

    this.ShowCertificate = function () {
        let w = window.innerWidth * 0.7;
        let h = window.innerHeight * 0.95;
        let counter = 0;
        let self = this;
        let buttoncont;
        // let certcont;

        let form = new mobiwork.Form({
            text: "",
            height: h,
            width: w,
            showcancel: true,
            showok: true,
            class: "about"

        });

        let scroll = new mobiwork.ScrollContainer({ class: "about" });

        for (let i = 0; i < $COURSE.length; i++) {
            let query = { courseid: $COURSE[i]._id.value };

            mobiwork.POST($API + "modulescomplog/GetCertificate", JSON.stringify(query)).then(function (response) {
                if (response === true) {
                    counter++;

                    let thisisimage = new mobiwork.Image({ src: $PUBLIC + "/certificate/certificate.jpg" });
                    // thisisimage.setAttribute('crossorigin', 'anonymous');

                    let certcont = scroll.Add(new mobiwork.Container({ class: "certificate-container" }));

                    // let certimg = certcont.Add(new mobiwork({ icon: $PUBLIC + "/certificate/certificate.jpg" }));
                    let certimg = certcont.Add(new mobiwork({ icon: thisisimage }));

                    let certname = certcont.Add(new mobiwork({ text: $ACCOUNT.user.name, class: "certificate-name" }));

                    let certtitle = certcont.Add(new mobiwork({ text: $COURSE[i].title.value, class: "certificate-title" }));
                }

                buttoncont = scroll.Add(new mobiwork.Container({ class: "cert-button-container" }));
                buttoncont.Add(new mobiwork.ToolbarButton
                    ({
                        icon: "file-pdf-box",
                        class: "button-getpdf",
                        data: i,
                        onclick: function (data) {
                            let htmlDom = document.getElementsByClassName('certificate-container')[data.data];
                            html2canvas(htmlDom, {
                                useCORS: true,
                                onrendered: function (canvas) {
                                    // var pdf = new jsPDF('p', 'pt', 'letter');
                                    var pdf = new jsPDF('landscape', 'pt', 'a4');

                                    var pageHeight = 1000;
                                    var pageWidth = 1080;
                                    // var pageWidth = 900;
                                    for (var i = 0; i <= htmlDom.clientHeight / pageHeight; i++) {
                                        var srcImg = canvas;
                                        var sX = 0;
                                        var sY = pageHeight * i; // start 1 pageHeight down for every new page
                                        var sWidth = pageWidth;
                                        var sHeight = pageHeight;
                                        var dX = 0;
                                        var dY = 0;
                                        var dWidth = pageWidth;
                                        var dHeight = pageHeight;

                                        window.onePageCanvas = document.createElement("canvas");
                                        onePageCanvas.setAttribute('width', pageWidth);
                                        onePageCanvas.setAttribute('height', pageHeight);
                                        var ctx = onePageCanvas.getContext('2d');
                                        ctx.drawImage(srcImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

                                        var canvasDataURL = onePageCanvas.toDataURL("image/png", 1.0);
                                        var width = onePageCanvas.width;
                                        var height = onePageCanvas.clientHeight;

                                        var marginX = (pageWidth - width) / 2;
                                        var marginY = (pageHeight - height) / 2;

                                        if (i > 0) // if we're on anything other than the first page, add another page
                                            pdf.addPage(612, 864); // 8.5" x 12" in pts (inches*72)

                                        pdf.setPage(i + 1); // now we declare that we're working on that page
                                        pdf.addImage(canvasDataURL, 'PNG', -113, 0, (width - 20), height); // add content to the page
                                        // pdf.addImage(canvasDataURL, 'PNG', 20, 40, (width * .62), (height * .62)); // add content to the page
                                    }

                                    // Save the PDF
                                    // pdf.save('document.pdf');
                                    pdf.save($COURSE[data.data].title.value + " Certificate.pdf");

                                }
                            });

                        }

                    }));

                buttoncont.Add(new mobiwork.ToolbarButton({
                    icon: "download",
                    class: "button-getpng",
                    data: i,
                    onclick: function (data) {
                        let htmlDom = document.getElementsByClassName('certificate-container')[data.data];
                        // html2canvas(document.getElementsByClassName("certificate-container"), {
                        html2canvas(htmlDom, {
                            useCORS: true,
                            width: htmlDom.clientWidth + 80,
                            height: htmlDom.clientHeight + 80,
                        }).then(function (canvas) {
                            var anchorTag = document.createElement("a");
                            document.body.appendChild(anchorTag);
                            anchorTag.download = $COURSE[data.data].title.value + " Certificate.jpg";
                            // anchorTag.download = "filename.jpg";
                            anchorTag.href = canvas.toDataURL();
                            anchorTag.target = '_blank';
                            anchorTag.click();
                        });
                    }
                }));

                if (i === $COURSE.length - 1) {
                    if (counter === 0) {
                        let incomcontainer = scroll.Add(new mobiwork.Container());
                        incomcontainer.Add(new mobiwork({ text: "Please complete your course!", icon: "alert-circle", class: "certificate-notcomplete" }));

                        form.Add(incomcontainer);
                    }
                    form.Add(scroll);
                    form.Show(view);
                }
            });
        }
    };

    this.About = function () {
        let w = window.innerWidth * 0.7;
        let h = window.innerHeight * 0.95;
        let form = new mobiwork.Form({
            text: "",
            height: h,
            width: w,
            showcancel: true,
            showok: true,
            class: "about"

        });

        let scroll = new mobiwork.ScrollContainer({ class: "about" });
        let aboutcont = scroll.Add(new mobiwork.Container({ text: "About The Hub", class: "about-view", icon: "card-text" }));

        let aboutdesc = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum<br><br>";
        aboutcont.Add(new mobiwork({ text: aboutdesc, class: "term" }));


        let featurecont = scroll.Add(new mobiwork.Container({ text: "Features", class: "about-view", icon: "apps" }));
        featurecont.Add(new mobiwork.List({ text: "Self-Guided Presentations", class: "term", icon: "presentation-play" }));
        featurecont.Add(new mobiwork.List({ text: "GCF Insight Videos", class: "term", icon: "youtube" }));
        featurecont.Add(new mobiwork.List({ text: "Trainer Module Videos", class: "term", icon: "video" }));
        featurecont.Add(new mobiwork.List({ text: "Practice Tools", class: "term", icon: "clipboard-text" }));
        featurecont.Add(new mobiwork.List({ text: "Quizzes", class: "term", icon: "format-list-checks" }));
        featurecont.Add(new mobiwork.List({ text: "Discussion Boards", class: "term", icon: "comment-text-outline" }));
        featurecont.Add(new mobiwork.List({ text: "Resources", class: "term", icon: "library" }));

        let disclaimercont = scroll.Add(new mobiwork.Container({ text: "Disclaimer", class: "about-view", icon: "shield-alert" }));
        disclaimercont.Add(new mobiwork({ text: aboutdesc, class: "term" }))

        form.Add(scroll);
        // form.Add(featurecont);
        // form.Add(featurepanel);
        form.Show(view);



    };

    this.Exit = function () {
        window.location.href = "http://ehub.rrcap.ait.ac.th/";
    };

    this.Logout = function () {
        $ACCOUNT.Logout();
        window.location.href = window.location.href.split("?")[0];
    };

    this.AccountInformation = function () {
        let form = new mobiwork.Form({
            text: "Account Information",
            width: window.innerWidth * 0.2,
            height: window.innerHeight * 0.5,
            onok: function () {
                if (name.value && name.value.trim() !== "" && email.value && email.value.trim() !== "") {
                    let data = { _id: $ACCOUNT.user._id };
                    $ACCOUNT.AddCredentials(data);

                    data.name = name.value;
                    data.email = email.value;

                    user.name = data.name;
                    user.email = data.email;

                    mobiwork.POST($API + "users/Update", JSON.stringify(data)).then(function (response) {
                        if (response) {
                            let message = new mobiwork.MessageBox({
                                text: "Saved",
                                message: "Student information was successfully saved!",
                                showcancel: false
                            });

                            message.Show();
                        } else {
                            let message = new mobiwork.MessageBox({
                                text: "Error",
                                message: "Unable to save information.",
                                showcancel: false
                            });

                            message.Show();
                        }
                    });
                } else {
                    let message = new mobiwork.MessageBox({
                        text: "Error",
                        message: "Please fill-up all the required information.",
                        showcancel: false
                    });

                    message.Show();
                }
            }
        });

        let user = $ACCOUNT.user;

        let name = form.Add(new mobiwork.InputText({ text: "Name", value: user.name }));
        let email = form.Add(new mobiwork.InputText({ text: "Email", value: user.email }));

        form.Show();
    };
};