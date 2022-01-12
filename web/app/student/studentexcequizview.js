
    var studentexcequizview = function (param) {
        let self = this;
        let model;
        let course = $COURSE;
        let viewparent;
        let tablecontainer;
        let splitrightcontainer;
        let tab;
        let readonly = false;
        var splitter;
    
        let conttype;
        let containerquestion;
        let containerchoices;
    
        let allchoices;
    
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
                    let homepage = new studentcontentview(param);
                    homepage.Show(viewparent);
                }
            });
    
            tablecontainer = new mobiwork.SplitContainer({
                gap: 1,
                class: "contentview",
                children: [{ size: 240 }]
            });
    
            tablecontainer.Show(parent);
            back.Show(parent);
    
            // self.ShowCourses();
            self.ShowLeftPanel();
            self.ShowRightPanel();
        };
    
        this.ShowLeftPanel = function (parent) {
            let container = new mobiwork.ScrollContainer();
            let buttoncontainer = container.Add(new mobiwork.Container({ class: "button-container" }));
            buttoncontainer.Add(new mobiwork.Button({
                text: "+ Add Content",
                class: "button-addcontent",
                onclick: function () {
                }
            }));
    
            if (parent)
                container.Show(tablecontainer);
            else
                tablecontainer.Set(0, container);
        };
    
        this.ShowRightPanel = function (parent) {
            let containerright = new mobiwork.Container();
            splitrightcontainer = containerright.Add(new mobiwork.SplitContainer({
                gap: 2
            }));
    
            if (parent)
                containerright.Show(parent);
            else
                tablecontainer.Set(1, containerright);
    
            self.ShowQuestion();
            self.ShowChoices();
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
                        qcontiner.Add(new mobiwork.InputTextArea({ placeholder: response[i].choices[response[i].answer[j]] }));
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
    
            if (allchoices) {
                let ccontiner = containerchoices.Add(new mobiwork.ScrollContainer({ class: "choices-center-container" }));
                ccontiner.Add(new mobiwork({ text: "Drop your answer into the left side box", class: "qheader" }))
    
                for (let i = 0; i < allchoices.length; i++) {
                    ccontiner.Add(new mobiwork({ text: allchoices[i], class: "all-choices" }));
                }
    
                if (parent)
                    containerchoices.Show(parent);
                else
                    splitrightcontainer.Set(1, containerchoices);
            }
        }
    };