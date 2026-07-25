/**
 * ==========================================================
 * FILE    : auth.js
 * VERSION : 1.0.0
 * ==========================================================
 */

const Auth = {};

Auth.saveSession = function(data){

    localStorage.setItem(
        CONFIG.SESSION_KEY,
        data.token
    );

    localStorage.setItem(
        CONFIG.USER_KEY,
        JSON.stringify(data)
    );

};

Auth.getToken = function(){

    return localStorage.getItem(
        CONFIG.SESSION_KEY
    );

};

Auth.getUser = function(){

    const user = localStorage.getItem(
        CONFIG.USER_KEY
    );

    return user
        ? JSON.parse(user)
        : null;

};

Auth.logout = function(){

    localStorage.removeItem(
        CONFIG.SESSION_KEY
    );

    localStorage.removeItem(
        CONFIG.USER_KEY
    );

    window.location.href =
        "login.html";

};

Auth.isLoggedIn = function(){

    return !!Auth.getToken();

};

Auth.requireLogin = function(){

    if(!Auth.isLoggedIn()){

        window.location.href =
            "login.html";

    }

};

Auth.validateSession = async function(){

    const token = Auth.getToken();

    if(!token){

        Auth.logout();
        return;
    }

    const result = await API.post({

        module:"auth",

        action:"validate",

        token:token

    });

    if(!result.success){

        Auth.logout();
    }

};