const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8087 });

/**
* smoke 8088
* single 8090
* @return {void}
*/
const SMOKE = {
  nameList: [
    { name: "max", ip: "172.18.180.22" },
    { name: "carver", ip: "172.18.180.130" },
    { name: "voot", ip: "172.18.180.36" },
    { name: "holly", ip: "172.18.180.238" },
    { name: "yida", ip: "172.18.180.92" },
    { name: "casino", ip: "172.18.180.44" },
    { name: "yellow", ip: "172.18.180.35" }
  ],
  PORT: 8088
}
const SINGLE = {
  nameList: [
    { name: "CSDN", ip: "172.18.180.37" },
    { name: "W3C School", ip: "172.18.180.35" },
  ],
  PORT: 8090
}
const SERVER_PORT = SINGLE; //访问端口号8088
// const PORT = 8088;

/*const nameList = [
  // { name: "max", ip: "172.18.180.22" },
  // { name: "carver", ip: "172.18.180.130" },
  // { name: "voot", ip: "172.18.180.36" },
  // { name: "holly", ip: "172.18.180.238" },
  // { name: "yida", ip: "172.18.180.92" },
  // { name: "casino", ip: "172.18.180.44" },
  { name: "小宝贝", ip: "172.18.180.67" },
  { name: "yellow", ip: "172.18.180.236" },
]*/

let onlineList = []

server.on('open', function open() {
  console.log('connected');
});

server.on('close', function close() {
  console.log('disconnected');
});

server.on('connection', function connection(ws, req) {
  const remoteAddress = req.connection.remoteAddress;
  const port = req.connection.remotePort;
  const ip = remoteAddress.substr(remoteAddress.lastIndexOf(":") + 1, remoteAddress.length - 1)
  const clientName = ip + port;
  console.log(ip)
  let ipName = ""
  if (checkUser(ip)) {
    ipName = formatName(ip)
    if (onlineList.indexOf(ipName) == -1) {
      onlineList.push(ipName)
    }
    // 发送欢迎信息给客户端
    broadcast(JSON.stringify({
      type: 'status',
      onlineList: onlineList,
      name: ipName,
      message: '上线了'
    }))
  } else {
    server.close()
    return false
  }

  // ws.send("Welcome " + clientName);

  // console.log('%s is connected', clientName)

  ws.on('message', function incoming(message) {
    console.log("receive: ", message, ipName)
    //文字
    if (typeof (message) == "string") {
      let receive = JSON.parse(message)
      if (receive.message == "offLine") {
        onlineList.splice(onlineList.indexOf(ipName), 1)
        broadcast(JSON.stringify({
          type: 'status',
          name: ipName,
          onlineList: onlineList,
          message: '下线了'
        }))
      } else {
        broadcast(JSON.stringify({
          type: 'chat',
          name: ipName,
          onlineList: onlineList,
          message: receive.message,
          time: getTime()
        }))
      }
    } else {
      //图片
      broadcast(message)
    }
  });

  function broadcast(sendData) {
    // 广播消息给所有客户端
    server.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(sendData);
      }
    });
  }

  function formatName(ip) {
    for (let i in SERVER_PORT.nameList) {
      if (SERVER_PORT.nameList[i].ip == ip) {
        return SERVER_PORT.nameList[i].name
      }
    }
  }

  function checkUser(ip) {
    let isGroup = false
    SERVER_PORT.nameList.forEach(item => {
      if (item.ip == ip) {
        isGroup = true
      }
    })
    return isGroup
  }
});

function getTime() {
  let date = new Date()
  let m = (date.getMonth() + 1 + "").padStart(2, 0);
  let d = (date.getDate() + "").padStart(2, 0);
  let h = (date.getHours() + "").padStart(2, 0);
  let mm = (date.getMinutes() + "").padStart(2, 0);
  return `${m}/${d} ${h}:${mm}`
}

var http = require('http'); //引入http模块
var fs = require('fs'); //引入fs模块
var url = require('url');//引入url模块
var path = require('path');//引入path模块

// req : 从浏览器带来的请求信息
// res : 从服务器返回给浏览器的信息
var nodeServer = http.createServer(function (req, res) {
  var pathname = url.parse(req.url).pathname;;
  //客户端输入的url，例如如果输入localhost:8888/index.html，那么这里的url == /index.html 
  //url.parse()方法将一个URL字符串转换成对象并返回，通过pathname来访问此url的地址。

  var realPath = path.join('./index.html', pathname);
  //完整的url路径
  // console.log(realPath);  
  // F:/nodejs/nodetest/index.html

  fs.readFile(realPath, function (err, data) {
    /*
    realPath为文件路径
    第二个参数为回调函数
        回调函数的一参为读取错误返回的信息，返回空就没有错误
        二参为读取成功返回的文本内容
    */
    if (err) {
      //未找到文件
      res.writeHead(404, {
        'content-type': 'text/plain;charset="utf-8"'
      });
      res.write('404,页面不在');
      res.end();
    } else {
      //成功读取文件
      res.writeHead(200, {
        'content-type': 'text/html;charset="utf-8"'
      });
      res.write(data);
      res.end();
    }
  })
});
nodeServer.listen(SERVER_PORT.PORT); //监听端口
console.log('服务成功开启');