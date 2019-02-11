"use strict";
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const extend = require('util')._extend

http.listen(process.env.PORT || 2525, function(){
  console.log("PORT : " + process.env.PORT || 2525);
});


var getIP = function (req) {
  if (req.headers['x-forwarded-for']) {
    return req.headers['x-forwarded-for'];
  }
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }
  if (req.connection.socket && req.connection.socket.remoteAddress) {
    return req.connection.socket.remoteAddress;
  }
  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress;
  }
  return '0.0.0.0';
};

require('date-utils') //現在時刻の取得に必要

//選択肢
//var a = 0
//var b = 0
//var c = 0
//var d = 0
var a = ['',0]
var b = ['',0]
var c = ['',0]
var d = ['',0]

app.use(bodyParser.urlencoded({extended: true}))

//入力側画面指定
app.use("/controller",express.static(path.join(__dirname, 'public')))

//コメント／スタンプ出力側画面指定
app.get("/display", function(req, res){
  res.sendFile(__dirname + '/index_nico-Display.html');
});
//chart出力側画面指定
app.get("/chart", function(req, res){
  res.sendFile(__dirname + '/index_chart.html');
});
//ID割当
app.get('/matching', function(req, res){
  if (a[0] == '') {
    a[0] = getIP(req);
    console.log(a[0]);
    console.log('a');
    res.send('A');
  } else if (b[0] == '') {
    b[0] = getIP(req);
    res.send('B');
  } else if (c[0] == '') {
    c[0] = getIP(req);
    res.send('C');
  } else if (d[0] == '') {
    d[0] = getIP(req);
    res.send('D');
  } else {
    res.send('no id');
  }
});

app.get('/comment', function (req, res) {
  const msg = extend({}, req.query)
  console.log("/IP:" + getIP(req) +'/comment: ' + JSON.stringify(msg))
  io.emit('comment', msg);
  res.end()
})

app.get('/like', function (req, res) {
  const msg = extend({}, req.query);
  var dt = new Date()
  console.log("/IP:" + getIP(req) +'/like: ' + JSON.stringify(msg))
  switch ( JSON.stringify(msg) )
{
    case '{"image":"A"}' : a[1]++;
     break;
    case '{"image":"B"}' : b[1]++;
     break;
    case '{"image":"C"}' : c[1]++;
     break;
    case '{"image":"D"}' : d[1]++;
     break;
    case '{"image":"Reset"}' : a[1]=b[1]=c[1]=d[1]=0;
     break;
    default:
     console.log("etc")
     break;
}
  var stamp_cnt = [[a[1]],[b[1]],[c[1]],[d[1]]]
  io.emit('like', msg)
  io.emit('chart', stamp_cnt)
  console.log(stamp_cnt)
  res.end()
})
