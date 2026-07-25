/**
 * ==========================================================
 * FILE    : utils.js
 * VERSION : 1.0.0
 * ==========================================================
 */

const Utils = {};

Utils.formatRupiah = function(number){

    return new Intl.NumberFormat(
        "id-ID",
        {
            style:"currency",
            currency:"IDR",
            minimumFractionDigits:0
        }
    ).format(number);

};

Utils.formatTanggal = function(date){

    return new Date(date)
        .toLocaleDateString(
            "id-ID",
            {
                day:"2-digit",
                month:"long",
                year:"numeric"
            }
        );

};

Utils.showLoading = function(){

    document
        .getElementById("loading")
        ?.classList.add("show");

};

Utils.hideLoading = function(){

    document
        .getElementById("loading")
        ?.classList.remove("show");

};

Utils.showToast = function(message,type="success"){

    const toast =
        document.getElementById("toast");

    if(!toast) return;

    toast.innerText = message;

    toast.className =
        "toast " + type;

    toast.classList.add("show");

    setTimeout(function(){

        toast.classList.remove("show");

    },3000);

};

Utils.handleSessionError = function(result){

    if(
        !result.success &&
        (
            result.message.includes("Token")
            ||
            result.message.includes("Session")
        )
    ){

        Auth.logout();

        return true;
    }

    return false;

};