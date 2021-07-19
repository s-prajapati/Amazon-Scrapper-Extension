chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.destination === 'track current') {
        try{
            const name = document.querySelector('span[id=productTitle]').innerHTML.replace(/[\r\n]+/gm, '');
            const price = document.querySelector('span[id^=priceblock_]').innerHTML;
    
    
            const href = new URL(window.location.href);
            const [identifier] = href.pathname.split('/').filter((val) => val.length === 10).slice(-1)
    
            const url = href.hostname + href.pathname;
    
            sendResponse({name, identifier, url, price, status: 'success'})
            return true;

        } catch (e){
            console.error(e);
            sendResponse({status: 'Scrape Unsuccessful'});
        }
    }
    return true;
})