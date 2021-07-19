const signupUrl = 'http://localhost:8000/user/signup';
const loginUrl  = 'http://localhost:8000/user/login';
const trackUrl  = 'http://localhost:8000/user/track';
const fetchUrl  = 'http://localhost:8000/user/fetch';
const startUrl  = 'http://localhost:8000/user/me';

chrome.runtime.onInstalled.addListener(() => {
    console.log("Installed Extension!");

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(request.destination === 'login') {
            handleLogin(request, sendResponse);

            return true;
        } else if(request.destination === 'signup') {
            handleSignup(request, sendResponse)

            return true;
        } else if(request.destination === 'track current') {
            chrome.storage.local.get('token', (result) => {
                handleTrackCurrent(request, sendResponse, result.token);
            })

            return true;
        } else if(request.destination === 'show tracked') {
            chrome.storage.local.get('token', (result) => {
                handleShowTracked(request, sendResponse, result.token);
            })
        } else if(request.destination === 'open popup') {
            chrome.storage.local.get('token', (result) => {
                if(result.token) {
                    handlePopupOpen(sendResponse, result.token);
                    return true;
                } else {
                    sendResponse({ status: 'no token'})
                    return true;
                }
            })
        } else if(request.destination === 'logout') {
            chrome.storage.local.remove('token', () => {
                sendResponse({ status: 'success'});
            });
        }
        return true;
    })
})

const handleSignup = (request, sendResponse) => {
    $.ajax({
        url: signupUrl,
        data: request,
        type: 'POST',
        success: function(response) {
            chrome.storage.local.set({
                token: response.token
            })
            sendResponse({status: "success"})
        },
        error: function(response) {
            if(response.statusCode === 500) {
                sendResponse({
                    status: 'Database Error',
                    action: 'Retry'
                })
            } else if(response.status === 400) {
                if(response.message === "User Already Exists") {
                    sendResponse({
                        status: 'Duplicate User',
                        action: 'Redirect Login'
                    }) 
                } else {
                    sendResponse({
                        status: 'Invalid Credentials',
                        errors: response.responseJSON.errors,
                        action: 'Reenter Creds'
                    })  
                }
            } else {
                sendResponse({status: "error", response: response});
            }
        },
    })
};

const handleLogin = (request, sendResponse) => {
    $.ajax({
        url: loginUrl,
        data: request,
        type: 'POST',
        success: function(response) {
            chrome.storage.local.set({
                token: response.token
            })
            sendResponse({status: "success"});
            
        },
        error: function(response) {
            if(response.statusCode == 500) {
                sendResponse({
                    status: 'Invalid Token',
                    action: 'Relogin'
                })
            } else if(response.statusCode == 401) {
                sendResponse({
                    status: 'Auth Error',
                    action: 'Relogin'
                })
            } else if(response.status == 400) {
                sendResponse({
                    status: 'Invalid Credentials',
                    action: 'Reenter Credentials'
                })
            } else {
                sendResponse({status: "error", response: response});
            }
        },
    });
};

const handleTrackCurrent = (request, sendResponse, token) => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        const tab = tabs[0];
        const tabUrl = new URL(tab.url);
        if(tabUrl.hostname === 'www.amazon.in') {
            const path = tabUrl.pathname.split('/');
            if(path.includes('dp')) {
                chrome.tabs.sendMessage(tab.id, {
                    destination: 'track current'
                }, (response) => {
                    if(response.status !== 'success') {
                        sendResponse({status: 'error'});
                        return true;
                    }
                    const {name, identifier, url, price} = response;
                    $.ajax({
                        url: trackUrl,
                        data: {name, identifier, url, price},
                        type: 'POST',
                        headers: {token},
                        success: (response) => {
                            sendResponse({status: "success"})
                            return true;
                        },
                        error: (response) => {
                            console.error(('tracking error: ', response))
                            sendResponse({status: "error"})
                            return true;
                            
                        }
                    });
                });
                
                return true;
            }
        }

        sendResponse({
            status: 'Wrong url',
            action: 'Change Page'
        });
        return true;
    });
    return true;
}

const handleShowTracked = (request, sendResponse, token) => {
    $.ajax({
        url: fetchUrl,
        type: 'GET',
        headers: {token},
        success: (response) => {
            sendResponse({
                status: "success",
                itemList : response.itemList
            });
            return true;
        },
        error: (response) => {
            console.error(('fetching error: ', response.responseText))
            sendResponse({status: "error"})
            return true;
            
        }
    });
};

const handlePopupOpen = (sendResponse, token) => {
    $.ajax({
        url: startUrl,
        type: 'GET',
        headers : { token },
        success: (response) => {
            sendResponse({ status: 'logged in' });
        }, 
        error: (response) => {
            sendResponse({ status: 'token expired'})
        }
    })
}