const $URL = "http://localhost:1565/";
const $API = $URL + "api/";
const $PUBLIC = $URL + "public/";

const $BUNDLEID = "com.ait.elearned";

var $ACCOUNT;
var $PHONE;

var $COURSE = [];
var $MODDESC;

mobiwork.Main = function () {
    $PHONE = mobiwork.mobile && (window.innerWidth < 500 || window.innerHeight < 500);

    //?email=dfadfadf&reset=1
    let paramreset = mobiwork.GetParameterByName("reset", window.location.href);
    let paramemail = mobiwork.GetParameterByName("email", window.location.href);

    //Show student information
    //?id=ewafdfdsf0djdfkdfk
    //Handle this only for the admin
    let paramid = mobiwork.GetParameterByName("id", window.location.href);

    if (paramreset && paramemail) {
        let view = new mobiwork.ResetPassword({
            email: paramemail,
            reset: paramreset,
        });

        view.Show();

    } else {
        if (mobiwork.mobile) {
            //For mobile application
            if (mobiwork.mobile) {
                $ACCOUNT = new mobiwork.Account({
                    onok: function () {
                        let view = new mainview();
                        view.Show();
                    },
                    onerror: function () {
                        let user = localStorage.getItem($BUNDLEID);

                        if (user) {
                            ShowMainView();
                        } else {
                            $ACCOUNT.Show();
                        }
                    }
                });

                $ACCOUNT.Show(true);

            } else {
                //For web application
                $ACCOUNT = new mobiwork.Account({
                    onok: function () {
                        ShowMainView();
                    }
                });

                $ACCOUNT.Show();
            }

        } else {
            //For web application
            $ACCOUNT = new mobiwork.Account({
                onok: function () {
                    ShowMainView();
                }
            });

            $ACCOUNT.Show();
        }
    }

    function ShowMainView() {
        let view = new mainview();
        view.Show();
    }
};

// } else if (paramid) {
//     //Only for ADMIN
//     if ($ACCOUNT.user.admin) {
//         //Query record with _id = paramid
//         // let view = new mainview();
//         // view.DownloadData();
//     }
