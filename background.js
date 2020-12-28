// background.js


let h_unityfiles_url = "https://images.habbo.com/habbo-webgl-clients/*/WebGL/habbo2020-global-prod/";
let g_unityfiles_port = 9089;

let redirects = {
    "Build/habbo2020-global-prod.data.unityweb": "/data",
    "Build/habbo2020-global-prod.wasm.code.unityweb": "/wasm/code",
    "Build/habbo2020-global-prod.wasm.framework.unityweb": "/wasm/framework",
    "Build/habbo2020-global-prod.json": "/prod",
    "Build/UnityLoader.js": "/unityloader",
    "assets/images/progressLogo.Dark.png": "/logo",
    "StreamingAssets/Version.txt": "/version"
};

let redirectRules = {};
for (let redirect in redirects) {
    redirectRules[redirect] = function (details) {
        return {redirectUrl: `http://localhost:${g_unityfiles_port}${redirects[redirect]}?blabla=` + details.url}
    };
}

function on_gearth_fileserver_open() {
    for (let redirect in redirects) {
        chrome.webRequest.onBeforeRequest.addListener(redirectRules[redirect], {
            urls : [`${h_unityfiles_url}${redirect}`]
        }, ["blocking"]);
    }
}

function on_gearth_fileserver_close() {
    for (let redirect in redirects) {
        chrome.webRequest.onBeforeRequest.removeListener(redirectRules[redirect]);
    }
}


let g_earth_awaiting_connection = false;
function do_ping() {
    $.ajax(`http://localhost:${g_unityfiles_port}/ping`, {
        timeout: 200,
        success: function (data,status,xhr) {   // success callback function
            if (!g_earth_awaiting_connection) {
                g_earth_awaiting_connection = true;
                on_gearth_fileserver_open();
            }

            setTimeout(do_ping, 200);
        },
        error: function (jqXhr, textStatus, errorMessage) { // error callback
            if (g_earth_awaiting_connection) {
                g_earth_awaiting_connection = false;
                on_gearth_fileserver_close();
            }

            setTimeout(do_ping, 200);
        }
    });
}
do_ping();
