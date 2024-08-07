import * as fs from 'fs';


fetch("https://api-v2.soundcloud.com/users/136005972/followings?limit=500&client_id=lPP5wRG1UkRxNZhnYd7OVc4umoqzySTZ&app_version=1722430138&app_locale=en", {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "upgrade-insecure-requests": "1",
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET"
})
.then(response => response.json())
.then(data => {
    fs.writeFileSync('followings.json', JSON.stringify(data, null, 4));
})