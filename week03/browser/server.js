/*jshint esversion: 6 */

const http = require("http");
const fs = require("fs");
const html = fs.readFileSync("./index.html", 'utf-8');
console.log(html);


var server = http.createServer((request, response) => {
    console.log(`request method = ${request.method} url = ${request.url}`);
    let data = [];
    request.on('error', (err) => {
        console.log(err);
    }).on('data', (chunk) => {
        data.push(chunk.toString());
    }).on('end', () => {
        console.log(data);
        data = Buffer.from(data.join('')).toString();
        console.log(`body = ${data}`);
        response.writeHead(200, {'Content-Type' : 'text/html'});
        response.end(html);
    });
});
server.listen(8888);
console.log("server listening port 8888 ...");