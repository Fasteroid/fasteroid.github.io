import https from 'https';

export let get: (url: string) => Promise<string>;
{
    const AGENT = new https.Agent({
        rejectUnauthorized: false // This line tells Node.js to ignore certificate validation
    });

    let REQUEST_OPTIONS: https.RequestOptions = {
        method: 'GET',
        agent: AGENT
    };
    
    get = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            
            const split = url.split('/');
            const hostname = split[2];
            const path = '/' + split.slice(3).join('/');

            console.log(hostname, path);

            REQUEST_OPTIONS.hostname = hostname;
            REQUEST_OPTIONS.path     = path;
            
            var req = https.request(REQUEST_OPTIONS, function (res) {
                let chunks: any[] = [];
                
                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });
                
                res.on("end", function (chunk: any) {
                    var body = Buffer.concat(chunks);
                    resolve(body.toString());
                });
                
                res.on("error", function (error) {
                    reject(error);
                });
            });
            
            req.end();
        });
    }
}