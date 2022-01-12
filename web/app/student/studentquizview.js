
var studentquizview = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let viewparent;
    let tablecontainer;
    let readonly = false;

    let quiz;
    let userid = $ACCOUNT.user._id;
    let allowback = true;
    let time = 0;
    let timercounter;
    let containerright;
    let submitbuttoncont;
    let arrayanswers = [];
    let total;
    let timer;

    let quizstatus;

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
                clearInterval(timer);
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

        self.CheckPassFailed();

        // self.ShowLeftPanel();
        // self.ShowRightPanel();
    };

    this.ShowLeftPanel = function (parent) {
        let container = new mobiwork.ScrollContainer({ class: "quiz-container-left" });
        time = param.length;
        starttime = time;

        let timecontainer = container.Add(new mobiwork.Container({ class: "timer" }));

        timecontainer.Add(new mobiwork({ text: "Instruction:<br>" + param.title, class: "instruction" }));
        timercounter = timecontainer.Add(new mobiwork({ text: self.FormatTime(time), class: "time" }))

        submitbuttoncont = timecontainer.Add(new mobiwork.Container({ class: "submitbuttoncont" }));

        submitbuttoncont.Add(new mobiwork.Button({
            text: "Submit",
            class: "submit-button",
            onclick: function () {
                let message = new mobiwork.MessageBox({
                    text: "Submit",
                    message: "Do you want to submit now?",
                    onok: function () {
                        self.SaveAndClose();
                    }
                });

                message.Show();
            }
        }));


        if (parent)
            container.Show(tablecontainer);
        else
            tablecontainer.Set(0, container);
    };

    this.ShowRightPanel = function (parent) {
        let data = { pid: param._id };
        let correct;
        let wrong;
        let scontainer;
        let startbuttoncont;

        containerright = new mobiwork.Container();

        startbuttoncont = containerright.Add(new mobiwork.Container({ class: "startbuttoncont" }));

        if (!quizstatus) {
            startbuttoncont.Add(new mobiwork.Button({
                text: "Start",
                class: "timer-button",
                onclick: function () {
                    self.StartTimer();
                    startbuttoncont.Dispose();
                    submitbuttoncont.object.css({ display: "block" });
                    scontainer.object.css({ display: "block" });
                }
            }));
        } else {
            startbuttoncont.Add(new mobiwork({ text: "You passed this quiz already!", class: "quiz-passed" }));
        }

        scontainer = containerright.Add(new mobiwork.ScrollContainer({ class: "quiz-right-container" }));
        quiz = scontainer.Add(new mobiwork.QuizContainer({
            userid: userid,
            presentationid: param._id,
            allowback: allowback,
            time: starttime,
            // visible: false,
            oncomplete: function () {
                quiz.Dispose();
            }
        }))


        mobiwork.POST($API + "quiz/GetByPresentationID", JSON.stringify(data)).then(function (response) {
            if (response) {
                total = response.length;
                let temp_ans;

                for (let i = 0; i < response.length; i++) {

                    //zin Apr2
                    switch (response[i].answer) {
                        case "A": case "a": temp_ans = "0"; break;
                        case "B": case "b": temp_ans = "1"; break;
                        case "C": case "c": temp_ans = "2"; break;
                        case "D": case "d": temp_ans = "3"; break;
                        case "E": case "e": temp_ans = "4"; break;

                        default:
                            break;
                    }


                    quiz.Add(new mobiwork.QuizMultipleChoice({
                        quizid: response[i]._id,
                        type: response[i].type,
                        question: response[i].question,
                        choices: response[i].choices,
                        //answer: response[i].answer,  
                        answer: temp_ans,//zin                      
                        correct: correct,
                        wrong: wrong,
                        data: response[i],
                        onclick: function (data) {
                            if (arrayanswers.length !== 0) {
                                for (let i = 0; i < arrayanswers.length; i++) {


                                    if (arrayanswers[i].quizid === data.data._id) {
                                        arrayanswers[i].userid = $ACCOUNT.userid;
                                        arrayanswers[i].presentationid = data.data.presentationid;
                                        arrayanswers[i].quizid = data.data._id;
                                        //arrayanswers[i].answer = data.data.answer;//comment zin
                                        arrayanswers[i].answer = temp_ans;
                                        arrayanswers[i].result = data.result;
                                        arrayanswers[i].time = time;

                                        // console.log(arrayanswers[i]);
                                    } else if (i === arrayanswers.length - 1) {
                                        arrayanswers.push({
                                            userid: $ACCOUNT.userid,
                                            presentationid: data.data.presentationid,
                                            quizid: data.data._id,
                                            //answer: data.data.answer,//comment zin
                                            answer: temp_ans,
                                            result: data.result,
                                            time: time
                                        });
                                        // console.log(arrayanswers);
                                    }
                                }
                            } else {
                                arrayanswers.push({
                                    userid: $ACCOUNT.userid,
                                    presentationid: data.data.presentationid,
                                    quizid: data.data._id,
                                    //answer: data.data.answer,//zin comment
                                    answer: temp_ans,
                                    result: data.result,
                                    time: time
                                });
                                // console.log("new data");
                            }

                            // if (data.useranswer === data.answer) {
                            // arrayanswers.push({
                            //     userid: $ACCOUNT.userid,
                            //     presentationid: data.data.presentationid,
                            //     quizid: data.data._id,
                            //     answer: data.data.answer,
                            //     result: data.result,
                            //     time: time
                            // });
                            // }

                        }
                    }));
                }
                if (parent)
                    containerright.Show(parent);
                else
                    tablecontainer.Set(1, containerright);
            }
        });
    };

    this.FormatTime = function (time) {
        let min = Math.floor(time / 60);
        let sec = time - min * 60;

        if (sec < 10)
            sec = "0" + sec;

        return min + ":" + sec;
    };

    this.StartTimer = function () {
        // let model = new userquizsummarymodel();

        //Timer
        timer = setInterval(function () {
            time--;

            if (time === 0) {
                clearInterval(timer);

                containerright.Dispose();
                self.SaveAndClose();

                return;
            }

            timercounter.text = self.FormatTime(time);
            timercounter.Refresh();

            // if (time % 10 === 0) {
            //     model.UpdateTime($USER._id, presentationid, time);
            // }
        }, 1000);
    };

    this.SaveAndClose = function () {
        // let model = new userquizsummarymodel();
        // model.Finish($USER._id, presentationid, noquestions).then(function (response) {
        let textmessage;
        let _score;
        // let _passingscore;

        if (arrayanswers.length !== 0) {
            let score = 0;

            for (let i = 0; i < arrayanswers.length; i++) {
                if (arrayanswers[i].result === 1)
                    score++;

                if (i === arrayanswers.length - 1) {
                    let percentage = Math.round(0.80 * total);
                    clearInterval(timer);

                    let remarks;
                    if (total === 4) {
                        if (score === total)
                            _score = 100;
                        else if (score === 0)
                            _score = 0;
                        else
                            _score = Math.round(((score / total) + 0.05) * 100);
                    } else if (total === 3) {
                        if (score === total)
                            _score = 100;
                        else if (score === 0)
                            _score = 0;
                        else
                            _score = Math.round(((score / total) + 0.14) * 100);
                    } else if (total === 2) {
                        if (score === total)
                            _score = 100;
                        else if (score === 0)
                            _score = 0;
                        else
                            _score = Math.round(((score / total) + 0.3) * 100);

                        if (score === 1)
                            percentage = 1;
                    } else {
                        _score = Math.round((score / total) * 100);
                    }

                    // if (_score >= percentage) {
                    if (score >= percentage) {
                        // _score = Math.round((score / total) * 100);
                        // _score = (score / total) * 100;

                        // textmessage = "Congratulations! You passed the quiz. Your score is " + score + " out of " + total + ".";
                        textmessage = "Congratulations! You passed the quiz. <br> Your Score is " + _score + "%";
                        // textmessage = "Congratulations! You passed the quiz. <br> Your Score is " + score;
                        remarks = "PASS";

                        let pushitems_ = { userid: $ACCOUNT.user._id, moduleid: param.moduleid, presentationid: arrayanswers[0].presentationid, complete: 1 };

                        mobiwork.POST($API + "userpresentationlog/Insert", JSON.stringify(pushitems_)).then(function (response) {
                            if (response) { }
                        });
                    } else {
                        // _score = Math.round((score / total) * 100);
                        // _score = (score / total) * 100;
                        textmessage = "Sorry! You didn't reach the passing score. Your score is " + _score + " %. Please try again. ";
                        // textmessage = "Sorry! You didn't reach the passing score.<br> Your score is " + score;
                        remarks = "FAILED";
                    }
                    // let scorepercent = 
                    // console.log(percentage);

                    let message = new mobiwork.MessageBox({
                        text: "Your Score",
                        message: textmessage, //"Thank you for taking the test. Your score is " + score + " out of " + total + ".",
                        showcancel: false,
                        onok: function () {
                            let timefinish;
                            for (let ii = 0; ii < arrayanswers.length; ii++) {
                                let dataitems = {
                                    userid: arrayanswers[ii].userid,
                                    presentationid: arrayanswers[ii].presentationid,
                                    quizid: arrayanswers[ii].quizid,
                                    answer: arrayanswers[ii].answer,
                                    result: arrayanswers[ii].result,
                                    time: arrayanswers[ii].time
                                }

                                mobiwork.POST($API + "userquizsummary/Insert", JSON.stringify(dataitems)).then(function (response) { });

                                if (i === arrayanswers.length - 1) {
                                    timefinish = arrayanswers[arrayanswers.length - 1].time
                                    clearInterval(timer);
                                    let homepage = new studentcontentview(param);
                                    homepage.Show(viewparent);
                                }
                            }

                            let insertuserquiz = {
                                userid: $ACCOUNT.user._id,
                                presentationid: param._id,
                                title: param.title,
                                score: score,
                                scorepercent: _score,
                                remarks: remarks,
                                timedone: timefinish,
                                moduleid: param.moduleid
                            }

                            mobiwork.POST($API + "userquiz/Insert", JSON.stringify(insertuserquiz)).then(function (response) { });
                        }
                    });
                    containerright.Dispose();
                    message.Show();
                }
            }
        } else {
            let form = new mobiwork.MessageBox({
                text: "Error",
                showcancel: false,
                message: "You did not answer the quiz!"
            });

            clearInterval(timer);

            form.Show();
        }
    };

    this.CheckPassFailed = function () {
        let counter = 0;

        let passfailed = { userid: $ACCOUNT.user._id, presentationid: param._id };
        mobiwork.POST($API + "userquiz/CheckPassFailed_", JSON.stringify(passfailed)).then(function (passfailed_) {
            if (passfailed_) {
                quizstatus = true;
            } else {
                quizstatus = false;
            }

            self.ShowLeftPanel();
            self.ShowRightPanel();
        });
    };

    // this.SaveAndClose = function () {
    //     // let model = new userquizsummarymodel();
    //     // model.Finish($USER._id, presentationid, noquestions).then(function (response) {
    //     if (arrayanswers.length !== 0) {
    //         let score = 0;

    //         for (let i = 0; i < arrayanswers.length; i++) {
    //             if (arrayanswers[i].result === 1)
    //                 score++;

    //             if (i === arrayanswers.length - 1) {
    //                 // let percentage = 0.80 * total;
    //                 // let scorepercent = 
    //                 // console.log(percentage);

    //                 let message = new mobiwork.MessageBox({
    //                     text: "Done",
    //                     message: "Thank you for taking the test. Your score is " + score + " out of " + total + ".",
    //                     showcancel: false,
    //                     onok: function () {
    //                         let timefinish;
    //                         for (let ii = 0; ii < arrayanswers.length; ii++) {
    //                             let dataitems = {
    //                                 userid: arrayanswers[ii].userid,
    //                                 presentationid: arrayanswers[ii].presentationid,
    //                                 quizid: arrayanswers[ii].quizid,
    //                                 answer: arrayanswers[ii].answer,
    //                                 result: arrayanswers[ii].result,
    //                                 time: arrayanswers[ii].time
    //                             }

    //                             mobiwork.POST($API + "userquizsummary/Insert", JSON.stringify(dataitems)).then(function (response) { });

    //                             if (i === arrayanswers.length - 1) {
    //                                 timefinish = arrayanswers[arrayanswers.length - 1].time
    //                                 clearInterval(timer);
    //                                 let homepage = new studentcontentview(param);
    //                                 homepage.Show(viewparent);
    //                             }
    //                         }

    //                         let insertuserquiz = {
    //                             userid: $ACCOUNT.user._id,
    //                             presentationid: param._id,
    //                             score: score,
    //                             timedone: timefinish
    //                         }

    //                         mobiwork.POST($API + "userquiz/Insert", JSON.stringify(insertuserquiz)).then(function (response) { });
    //                     }
    //                 });
    //                 containerright.Dispose();
    //                 message.Show();
    //             }
    //         }
    //     } else {
    //         let form = new mobiwork.MessageBox({
    //             text: "Error",
    //             showcancel: false,
    //             message: "You did not answer the quiz!"
    //         });

    //         form.Show();
    //     }
    // };
};