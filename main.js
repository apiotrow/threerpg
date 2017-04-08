document.addEventListener('DOMContentLoaded', function () {
	var THREE = require('three');
	var Game = require('./js/game/game.js')
	require('./js/three/CTMLoader.js')

	var assetnames = [
		"assets/ctms/bugsports.ctm",
		"assets/ctms/house2.ctm"
	]

	var promises = [];
	var assetmeshes = [];
	for(var i = 0; i < assetnames.length; i++){
		var file = assetnames[i];
		promises.push(
			new Promise(function(resolve, reject) {
				new THREE.CTMLoader().load(file, (geometry)=> {
					var material = new THREE.MeshPhongMaterial({
			        	wireframe: false, 
			        	shading: THREE.FlatShading, 
			        	vertexColors: THREE.VertexColors,
			        	shininess: 0
			        });

			        geometry.computeFaceNormals();
			        geometry.computeVertexNormals();

			        var obj = new THREE.Mesh(geometry, material);

			        Game.rotateLocal(obj, -90, 0, 0)

					assetmeshes.push(obj)
					resolve();
				})
			})
		)
	}
	Promise.all(promises).then(function(){
		var game = new Game(assetmeshes);
	})

})