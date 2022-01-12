var dashboard = function () {
    let self = this;
    let students;
    let admission = {};
    admission["Nursery"] = 1;
    admission["Pre-K1"] = 2;
    admission["Pre-K2"] = 3;
    admission["Kindergarten"] = 4;
    admission["Grade 1"] = 5;
    admission["Grade 2"] = 6;
    admission["Grade 3"] = 7;
    admission["Grade 4"] = 8;
    admission["Grade 5"] = 9;
    admission["Grade 6"] = 10;

    this.Show = function (parent) {
        let data = {};
        $ACCOUNT.AddCredentials(data);

        mobiwork.POST($API + "courses/GetAll", JSON.stringify(data)).then(function (response) {
            if (response) {
                students = [];

                let model;

                for (let i = 0; i < response.length; i++) {
                    model = new studentmodel();
                    model.Open(response[i]);

                    students.push(model);
                }

                self.ShowTable(parent);
            }
        });
    };

    this.ShowTable = function (parent) {
        let icon;

        students.sort(function (a, b) {
            if (admission[a.admission.value.text] > admission[b.admission.value.text])
                return 1;
            else if (admission[a.admission.value.text] < admission[b.admission.value.text])
                return -1;
            else {
                if (a.firstname.value > b.firstname.value)
                    return 1;
                else if (a.firstname.value < b.firstname.value)
                    return -1;
                else
                    return 0;
            }
        });

        let view = new studentview({
            children: students,
            readonly: true
        });

        view.Show(parent);
    };

    this.ShowChild = function (sender) {

    };
};