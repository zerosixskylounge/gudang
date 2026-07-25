/**
 * ==========================================================
 * FILE    : api.js
 * VERSION : 1.0.0
 * ==========================================================
 */

const API = {};

API.post = async function(payload){

    try{

        const response = await fetch(
            CONFIG.API_URL,
            {
                method:"POST",

                headers:{
                    "Content-Type":"text/plain;charset=utf-8"
                },

                body:JSON.stringify(payload)
            }
        );

        return await response.json();

    }catch(error){

        return {
            success:false,
            message:error.message
        };

    }

};

API.get = async function(){

    try{

        const response = await fetch(
            CONFIG.API_URL
        );

        return await response.json();

    }catch(error){

        return {
            success:false,
            message:error.message
        };

    }

};