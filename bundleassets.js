var recursive = require('recursive-readdir');
var fs = require('fs');

var assets = {}

new Promise(function(resolve, reject) {
	recursive("./assets/ctms", [], function (err, files) {
		files.forEach(file => {
			console.log(file)
			var name = file.replace(/\\/g, "/");
			assets[name] = 0;
		});
		
		resolve();
	})
}).then(()=>{
	fs.writeFile("./assets.json", JSON.stringify(assets), (err)=>{

	})
})

