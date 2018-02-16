const express = require('express');
const app = express();
const router = express.Router();
const multer = require('multer');


var path = require('path');
var upload = multer({ dest: 'uploads/' });
var PNF = require('google-libphonenumber').PhoneNumberFormat;
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var fs = require('fs');
// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

router.get('/api/phonenumbers/parse/text/:phoneNum',(req, res) => {
	var num = req.params.phoneNum.toString().replace(/\D/g, '');
	var list = [];

	if(num.length < 10 || num.length > 11 || (num.toString().charAt(0) != "1" && num.length == 11)){
		res.status(400).send("Invalid Number");
	}
	else{
		var phoneNumber = phoneUtil.parse(num, 'CA');
		list.push(phoneUtil.format(phoneNumber, PNF.INTERNATIONAL));
		res.status(200).send(list);
	}
});

router.get('/',(req, res) => {
	res.status(200).send('Works');
});

router.get('/api/phonenumbers/parse/file', (req, res) => {
    res.sendFile(__dirname + "/routing.html");
});

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads')
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
});

app.post('/api/phonenumbers/parse/file', function(req, res) {
	var list = [];
	var validFile = true;
	var upload = multer({
		storage: storage,
		fileFilter: function(req, file, callback) {
			if (path.extname(file.originalname) !== '.txt') {
				validFile = false
				return callback(res.end('Only text are allowed'), null)
			}
			callback(null, true)
		}
	}).single('userFile');
	upload(req, res, function(err) {
		try{
			var buffer = fs.readFileSync(req.file.path);
		
			buffer.toString().split(/\n/).forEach(function(line){
				try{
					var num = phoneUtil.parse(line.replace(/\D/g, ''),'CA');//get rid of alphabetic characters
					if(!isEmpty(num) && phoneUtil.isValidNumber(num)){
						list.push(phoneUtil.format(num,PNF.INTERNATIONAL));
					}
				}
				catch(err){
				}	
			});
		res.status(200).send(list);
		}
		catch (err){
			if(validFile){
				res.status(400).send("Invalid file");
			}
		}	
	})
});

app.use(router);

app.listen(9000, () => {
	console.log("Server started");
});



function isEmpty(obj) {

    if (obj == null) 
		return true;

    if (obj.length > 0)    
		return false;
    if (obj.length === 0)  
		return true;

    if (typeof obj !== "object") 
		return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) 
			return false;
    }

    return true;
}

module.exports = router;
