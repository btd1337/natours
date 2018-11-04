var express = require('express');
var app = express();
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/src/'));

app.listen(port);
console.log(`Server is running on port ${port}`);
