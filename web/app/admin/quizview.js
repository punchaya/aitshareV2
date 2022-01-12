var quizview = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let viewparent;
    let tablecontainer;
    let splitrightcontainer;
    let tab;
    let readonly = false;
    let presentationid = param._id;
    var splitter;

    let conttype;
    let containerquestion;
    let containerchoices;
    let containertop;

    let allchoices;



    let viewsavebutton = false;
    let viewdeletebutton = false;
    let clearalleditor = false;

    let _questiontitle;
    let _presentationorder;
    let _choices = [];
    let _Achoice;
    let _Bchoice;
    let _Cchoice;
    let _Dchoice;
    let _Echoice;

    let _answers;

    let quizdata;
    let allquizdata;


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
            class: "back-icon", icon: "mdi-arrow-left", onclick: function () {
                let homepage = new contentview(param);
                homepage.Show(viewparent);
            }
        });

        tablecontainer = new mobiwork.SplitContainer({
            gap: 1,
            class: "contentview",
            children: [{ size: 450 }]
        });

        tablecontainer.Show(parent);
        back.Show(parent);

        // self.ShowCourses();
        self.ShowLeftPanel();
        self.ShowRightPanel();
    };

    this.ShowLeftPanel = function (parent) {
        let container = new mobiwork.ScrollContainer({ class: "presentation-list-container" });
        // let container = new mobiwork.ScrollContainer({class:"quiz-container-adminview"});
        let buttoncontainer = container.Add(new mobiwork.Container({ class: "button-container" }));
        let data = { pid: presentationid };


        buttoncontainer.Add(new mobiwork.Button({
            text: "Add Question",
            class: "button-addcontent",
            icon: "plus",
            onclick: function () {
                clearalleditor = true;
                viewsavebutton = true;
                self.ShowRightPanel();
            }
        }));

        mobiwork.POST($API + "quiz/GetByPresentationID", JSON.stringify(data)).then(function (response) {
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

            allquizdata = response;

            for (let i = 0; i < response.length; i++) {
                container.Add(new mobiwork.List({
                    text: response[i].question,
                    data: response[i],
                    onclick: function (data) {
                        quizdata = data.data;
                        clearalleditor = false;
                        viewsavebutton = true;
                        self.ShowRightPanel();
                    },
                    tools: [
                        new mobiwork({
                            class: "quiz-list-order",
                            text: response[i].order
                        })
                    ]
                }));
            }


            if (parent)
                container.Show(tablecontainer);
            else
                tablecontainer.Set(0, container);

            self.ShowRightPanel();
        });



    };

    this.ShowRightPanel = function (parent) {
        let containerright = new mobiwork.Container();
        splitrightcontainer = containerright.Add(new mobiwork.SplitContainer({
            gap: 2,
            children: [{ size: window.innerWidth * 0.4 }],
            orientation: ORIENTATION.VERTICAL
        }));

        if (parent)
            containerright.Show(parent);
        else
            tablecontainer.Set(1, containerright);

        self.ShowTopPanel();
        self.ShowBotPanel();
        //Comment By Zin for a while March 16
        //self.ShowQuestion();
        //self.ShowChoices();
    };

    this.ShowQuestion = function (parent) {
        containerquestion = new mobiwork.Container({ class: "quest-container" });

        let qcontiner = containerquestion.Add(new mobiwork.ScrollContainer({ class: "quest-center-container" }));

        qcontiner.Add(new mobiwork({ text: "Match the Practice", class: "qheader" }))

        mobiwork.POST($API + "exercise/Get", JSON.stringify()).then(function (response) {
            // response.sort(function (a, b) {
            //     _a = parseInt(a.order);
            //     _b = parseInt(b.order);

            //     if (_a > _b)
            //         return 1;
            //     else if (_a < _b)
            //         return -1;
            //     else
            //         return 0;
            // });

            // allslidesdata = response;

            for (let i = 0; i < response.length; i++) {
                for (let j = 0; j < response[i].question.length; j++) {
                    qcontiner.Add(new mobiwork({ text: response[i].question[j] }));
                    //qcontiner.Add(new mobiwork.InputTextArea({ placeholder: response[i].choices[response[i].answer[j]] }));
                }
                allchoices = response[i].choices;
                self.ShowChoices();
            }


            if (parent)
                containerquestion.Show(parent);
            else
                splitrightcontainer.Set(0, containerquestion);

        });
    }

    this.ShowChoices = function (parent) {
        containerchoices = new mobiwork.Container({ class: "choices-container" });

        // if (allchoices) {
        //     let ccontiner = containerchoices.Add(new mobiwork.ScrollContainer({ class: "choices-center-container" }));
        //     ccontiner.Add(new mobiwork({ text: "Drop your answer into the left side box", class: "qheader" }))

        //     for (let i = 0; i < allchoices.length; i++) {
        //         ccontiner.Add(new mobiwork({ text: allchoices[i], class: "all-choices" }));
        //     }

        //     if (parent)
        //         containerchoices.Show(parent);
        //     else
        //         splitrightcontainer.Set(1, containerchoices);
        // }


        containerchoices.Add(new mobiwork.DragDrop({ dragtext: "Drag me to my target", droptext: "Drop here" }));;
        if (parent)
            containerchoices.Show(parent);
        else
            splitrightcontainer.Set(1, containerchoices);
    }

    this.ShowTopPanel = function (parent) {

        containertop = new mobiwork.Container({ class: "editorimage-container" });
        let model = new quiz_model();
        let quiztitle;
        let quizchoices = [];
        let quizanswer;
        let quizorder;
        //
        let quiza;
        let quizb;
        let quizc;
        let quizd;
        //

        //quizchoices.push(_Achoice, _Bchoice, _Cchoice, _Dchoice);
        if (quizdata) {
            quiztitle = quizdata.question;
            quizchoices = quizdata.choices;

            quizanswer = quizdata.answer;
            quizorder = quizdata.order;

        } else if (allquizdata) {
            if (allquizdata.length !== 0) {
                quiztitle = allquizdata[0].question;
                quizchoices = allquizdata[0].choices;
                quizanswer = allquizdata[0].answer;
                quizorder = allquizdata[0].order;
            }

        }

        if (clearalleditor === true) {

            quiztitle = undefined;
            quizchoices = undefined;
            quizanswer = undefined
            quizorder = undefined
        }

        let presinfocontainer = containertop.Add(new mobiwork.Container({ class: "pres-container" }));

        _questiontitle = presinfocontainer.Add(model.questiontitle);
        _questiontitle.value = quiztitle;

        //_choices = presinfocontainer.Add(model.choices);            
        // _choices.value = quizchoices[0].value;


        _Achoice = presinfocontainer.Add(model.Achoice);
        _Bchoice = presinfocontainer.Add(model.Bchoice);
        _Cchoice = presinfocontainer.Add(model.Cchoice);
        _Dchoice = presinfocontainer.Add(model.Dchoice);
        _Echoice = presinfocontainer.Add(model.Echoice);

        if (quizchoices !== undefined) {
            _Achoice.value = quizchoices[0];
            _Bchoice.value = quizchoices[1];
            _Cchoice.value = quizchoices[2];
            _Dchoice.value = quizchoices[3];
            _Echoice.value = quizchoices[4];
        }

        _answers = presinfocontainer.Add(model.answers);
        _answers.value = quizanswer;

        _presentationorder = presinfocontainer.Add(model.presenatationorder);
        _presentationorder.value = quizorder;

        if (parent)
            containertop.Show(parent);
        else
            splitrightcontainer.Set(0, containertop);
    };

    this.ShowBotPanel = function (parent) {
        let items = [];
        containerbot = new mobiwork.Container({ class: "editor-container" });

        let contbotsave = containerbot.Add(new mobiwork.Container({ class: "button-container" }));

        contbotsave.Add(new mobiwork.Button({
            text: "Save",
            class: "button-addcontent-slide",
            icon: "content-save-outline",
            data: items,
            visible: viewsavebutton,
            onclick: function (data) {

                _choices.push(_Achoice.value, _Bchoice.value, _Cchoice.value, _Dchoice.value, _Echoice.value);

                if (clearalleditor === true) {
                    items.push({
                        presentationid: presentationid,
                        question: _questiontitle.value,
                        choices: _choices,
                        answer: _answers.value,
                        order: _presentationorder.value,
                    });
                } else {
                    if (quizdata) {
                        items.push({
                            presentationid: presentationid,
                            question: _questiontitle.value,
                            choices: _choices,
                            answer: _answers.value,
                            order: _presentationorder.value,
                            _id: quizdata._id,
                        });
                    }
                    else {
                        items.push({
                            presentationid: presentationid,
                            question: _questiontitle.value,
                            choices: _choices,
                            answer: _answers.value,
                            order: _presentationorder.value,
                        });
                    }
                }


                mobiwork.POST($API + "quiz/Insert", JSON.stringify(data.data[0])).then(function (response) {
                    if (response) {
                        //let options = { _id: response[0]._id,  presid: presentationid, modtitle: param.moduletitle };

                        let quizid = { id: response[0]._id };
                        mobiwork.POST($API + "quiz/GetById", JSON.stringify(quizid)).then(function (res) {
                            if (res) {

                                prestype = undefined;
                                presentationdata = res[0];
                                quizdata = res[0];
                                clearalleditor = false;

                                let message = new mobiwork.MessageBox({
                                    text: "Submitted",
                                    message: "Save!",
                                    showcancel: false
                                });

                                self.ShowLeftPanel();
                                self.ShowTopPanel();
                                self.ShowBotPanel();

                                message.Show();
                                _choices.length = 0;//march 30
                            }
                        });

                    } else {
                        let message = new mobiwork.MessageBox({
                            text: "Error",
                            message: "Unable to save data.",
                            showcancel: false
                        });

                        message.Show();
                    }
                });
            }
        }));

        contbotsave.Add(new mobiwork.Button({
            text: "Delete",
            class: "button-addcontent-slide-delete",
            icon: "trash-can-outline",
            data: quizdata,
            visible: viewdeletebutton,
            onclick: function (data) {
                let message = new mobiwork.MessageBox({
                    text: "Confirmation",
                    message: "Would you like to delete this record?",
                    showcancel: true,
                    onok: function () {

                        mobiwork.POST($API + "quiz/DeleteDetails", JSON.stringify(data.data)).then(function (response) {
                            if (response) {

                                let message = new mobiwork.MessageBox({
                                    text: "Delete Record",
                                    message: "This record has been deleted!",
                                    showcancel: false
                                });

                                quizdata = undefined;

                                self.ShowLeftPanel();
                                self.ShowTopPanel();
                                self.ShowBotPanel();

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
        }));

        // containerbot.Add(new mobiwork({ text: "Content", class: "editor-header" }));

        // let editor = containerbot.Add(new mobiwork.InputTextArea({ placeholder: "Enter you text content here.", class: "editor-textarea" }));

        // containerbot.Add(new mobiwork({ text: "Expert Tip", class: "et-header" }));

        // let et = containerbot.Add(new mobiwork.InputTextArea({ placeholder: "Enter you exper tips here.", class: "editor-et" }));


        // if (quizdata) {
        //     if (quizdata.content)
        //         editor.value = quizdata.content;

        //     if (quizdata.experttip)
        //         et.value = quizdata.experttip;

        // } else if (allquizdata) {
        //     if (allquizdata.length !== 0) {
        //         if (allquizdata[0].content)
        //             editor.value = allquizdata[0].content;

        //         if (allquizdata[0].experttip)
        //             et.value = allquizdata[0].experttip;
        //     } else {
        //         editor.value = undefined;
        //         et.value = undefined;
        //     }
        // }

        if (clearalleditor === true) {
            // editor.value = undefined;
            // et.value = undefined;
        }

        if (parent)
            containerbot.Show(parent);
        else
            splitrightcontainer.Set(1, containerbot);
    }
};



var quiz_model = function () {

    this.questiontitle = new mobiwork.InputTextArea({
        text: "Question Title"
    });

    // this.choices = new mobiwork.InputTextArea({
    //     text: "Choices"
    // });

    this.choices = new mobiwork.Label({ text: "Choices" });

    this.Achoice = new mobiwork.InputText({ text: "A" });
    this.Bchoice = new mobiwork.InputText({ text: "B" });
    this.Cchoice = new mobiwork.InputText({ text: "C" });
    this.Dchoice = new mobiwork.InputText({ text: "D" });
    this.Echoice = new mobiwork.InputText({ text: "E" });

    this.answers = new mobiwork.InputText({
        text: "Answers"
    });

    this.presenatationorder = new mobiwork.InputText({
        text: "Presentation Order"
    });
};