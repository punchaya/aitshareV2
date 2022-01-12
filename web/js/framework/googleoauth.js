var googleoauth = function (param) {
    let self = this;
    let googleauth;

    this.onlogin = param.onlogin;
    this.onload = param.onload;
    this.authorized;

    gapi.load('client', function () {
        gapi.client.init({
            'apiKey': param.apikey,
            'clientId': param.clientid,
            'scope': param.scope,
            'discoveryDocs': param.discoverydocs

        }).then(function () {
            googleauth = gapi.auth2.getAuthInstance();

            // Listen for sign-in state changes.
            googleauth.isSignedIn.listen(self.UpdateSignin);

            let user = googleauth.currentUser.get();

            if (user.hasGrantedScopes(param.scope))
                self.onlogin(user);
            else
                self.onload();
        });
    });

    this.Login = function () {
        googleauth.signIn();
    };

    this.Logout = function () {
        googleauth.disconnect();
    };

    this.UpdateSignin = function (value) {
        self.authorized = value;

        if (self.authorized) {
            let user = googleauth.currentUser.get();
            self.onlogin(user);
        }
        else
            self.onload();
    };
};