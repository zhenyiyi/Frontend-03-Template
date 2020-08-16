/*jshint esversion: 6 */
const net = require("net");
const htmlParser = require("./parser.js");

/**
 * 请求类
 */
class Request {
    constructor(options) {
        this.method = options.method || 'GET';
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {};
        this.headers = options.headers || {};
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map((key) => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
        }
        this.headers['Content-Length'] = this.bodyText.length;
    }

    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ReponseParse();
            if (connection) {
                connection.write(this.toString());
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, ()=> {
                    connection.write(this.toString());
                });
            }
            connection.on('data', (data) => {
                console.log(data.toString());
                parser.receiveData(data.toString());

                // console.log(parser.response);
                // 解析完成，关闭连接
                if (parser.isFinished) {
                    connection.end();
                }
                resolve(parser.response);
            });
            connection.on('error', (err) => {
                reject(err);
                connection.end();
            })
        });
    }
    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r\n ${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}`
    }
}

class ReponseParse {
    constructor() {
        this.WAITING_STATUS_LINE = 0;
        this.WAITING_STATUS_LINE_END = 1;
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        this.WAITING_BODY = 7;
        this.current = this.WAITING_STATUS_LINE;
        this.statusLine = "";
        this.headers = {};
        this.headerName = "";
        this.headerValue = "";
        this.bodyParser = null;
    }
    receiveData(string) {
        for (let i=0; i<string.length; i++) {
            this.receiveChar(string[i]);
        }
        console.log(`this.headers -> ${this.headers} \n this.statusLine === ${this.statusLine}`);

        console.log(`this.body = ${this.bodyParser.content}`);
    }
    /**
     * 使用状态机来处理
     * @param {字符} c 
     */
    receiveChar(c) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (c === '\r') {
                this.current = this.WAITING_STATUS_LINE_END;
            }
            this.statusLine += c;
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (c === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (c === ':') {
                this.current = this.WAITING_HEADER_SPACE;
            } else if ( c === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END;
            } else {
                this.headerName += c;
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (c === ' ') {
                this.current = this.WAITING_HEADER_VALUE;
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (c === '\r') {
                this.current = this.WAITING_HEADER_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = "";
                this.headerValue = "";
                if (!this.bodyParser && this.headers["Transfer-Encoding"] === "chunked") {
                    this.bodyParser = new TrunkedBodyParser();
                }
            } else {
                this.headerValue += c;
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            this.current = this.WAITING_HEADER_NAME;
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (c === '\n') {
                this.current = this.WAITING_BODY;
            }
        } else if (this.current === this.WAITING_BODY) {
            // TODO
            this.bodyParser.receiveChar(c);
        }
    }

    get isFinished() {
        return this.bodyParser &&this.bodyParser.isFinished;
    }

    get response() {
        let result = this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S)]+)/);
        return {
            statusCode: result[1],
            statusText: result[2],
            headers: this.headers,
            body: this.bodyParser.content.join('') 
        }
    }
}

class TrunkedBodyParser {
    constructor() {
        this.WAIT_LENGTH = 0;
        this.WAIT_LENGTH_LINE_END = 1;
        this.READING_TRUNK = 2;
        this.WAIT_NEW_LINE = 3;
        this.WAIT_NEW_LINE_END = 4;
        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.current = this.WAIT_LENGTH;
    }
    receiveChar(c) {
        if (this.current === this.WAIT_LENGTH) {
            if (c === '\r') {
                if (this.length === 0) {
                    this.isFinished = true;
                }
                this.current = this.WAIT_LENGTH_LINE_END;
            } else {
                this.length *= 16;
                this.length += parseInt(c, 16);
            }
        } else if (this.current === this.WAIT_LENGTH_LINE_END) {
            if (c === '\n') {
                this.current = this.READING_TRUNK;
            }
        }  else if (this.current === this.READING_TRUNK) {
            if (this.isFinished) {
                return ;
            }
            this.content.push(c);
            this.length--;
            if (this.length === 0) {
                this.current = this.WAIT_NEW_LINE;
            }
        } else if (this.current === this.WAIT_NEW_LINE) {
            if (c == '\r') {
                this.current = this.WAIT_NEW_LINE_END;
            }
        } else if (this.current === this.WAIT_NEW_LINE_END) {
            if (c === '\n') {
                this.current = this.WAIT_LENGTH;
            }
        }
    }
}

void async function() {
    let req = new Request({
        method: 'GET',
        host: '127.0.0.1',
        path: '/',
        port: 8888,
        headers: {
            "userId" : '123456',
            "sessionId" : 'dad12312dad12'
        },
        body: {
            name: "fenglin",
            age: 30
        }
    });
    let response = await req.send();
    console.log(response);
    let dom = htmlParser.parserHTML(response.body);
    console.log(dom);
}();