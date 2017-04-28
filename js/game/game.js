var THREE = require('three');
require('../three/CTMLoader.js')
var perlin = require('perlin-noise');
var Tile = require('./tile.js')

class Game {
	constructor(assets){
		this.appW = 800;
		this.appH = 600;
		this.assets = assets;
		console.log(this.assets)
		this.titlebarheight = TITLEBARHEIGHT
		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.scene = new THREE.Scene();
	    this.camera = new THREE.PerspectiveCamera(75, this.appW / this.appH, 1, 10000);
	    // this.camera = new THREE.OrthographicCamera( -200, 200, 200, -200, -1000, 1000 );
	    this.worldg = new THREE.Group();
	    this.scene.add(this.worldg);

	    this.renderer.setSize(this.appW, this.appH);
	    document.body.appendChild(this.renderer.domElement);
	    this.scene.background = new THREE.Color(0x000000);
	    this.camera.position.z = 300;
	    this.camera.position.y = 300;
	    Game.rotateLocal(this.camera, -45, 0, 0)

	    this.raycaster = new THREE.Raycaster()
		this.mouse = new THREE.Vector2()
		window.addEventListener('mousemove', (e)=>{
			e.preventDefault();
			this.mouse.x = (e.clientX / this.appW) * 2 - 1;
			this.mouse.y = -((e.clientY - this.titlebarheight) / this.appH) * 2 + 1;
		}, false);

		this.tiles = {}
		this.currSelTile

	    var assetArray = Object.keys(this.assets)

		// for(var i = 0; i < 50; i++){
		// 	var randAsset = assetArray[Math.floor(Math.random() * assetArray.length)]
			// var obj = this.assets[randAsset].clone()

	  //       obj.position.x = (Math.random() * 1000) - 500
	  //       obj.position.z = -(Math.random() * 1000)

	  //       this.worldg.add(obj)
		// }

	
	    var light = new THREE.DirectionalLight(0xffffff, 0.5);
	    light.position.set(0.7, 1, -0.5)
	    light.target.position.set(0, 0, 0);
	    light.castShadow = true;
	    this.worldg.add(light);
	    
	    light = new THREE.AmbientLight(0x8C8C8C);
	 	this.worldg.add(light);

	    this.keyState = {};
	    window.addEventListener('keydown', (e)=>{
			this.keyState[e.key] = true;
		},true);	
		window.addEventListener('keyup', (e)=>{
			this.keyState[e.key] = false;
		},true);
		window.addEventListener('wheel', (e)=>{
			if(e.deltaY < 0){
				this.keyState['zoomIn'] = true;
			}
			else if(e.deltaY > 0){
				this.keyState['zoomOut'] = true;
			}
		}, {passive: true});
		window.addEventListener("mouseup", (e)=>{
			this.keyState["Lmouse"] = true;
		}, true);

		this.generateTerrain();

		this.update();
	}

	generateTerrain(){
		var geom = new THREE.Geometry();

		var mapDActual = 500;
		var tileD = 10
		var heightM = 130
		var hDiscLevels = 15;
		
		var mapD = mapDActual + 1
		var h = perlin.generatePerlinNoise(mapD, mapD);
		var h2 = perlin.generatePerlinNoise(mapD, mapD, {octaveCount: 7});
		for(var i in h2)
			h2[i] *= 2

		//create verts
		var heights = new Set()
		var verts = [];
		for(var i = 0; i < mapD; i++){
			for(var j = 0; j < mapD; j++){
				var index = (i * mapD) + j
				var hDisc = (Math.floor(h[index] * h2[index] * h2[index] * h2[index] * hDiscLevels) * heightM) / hDiscLevels;
				heights.add(hDisc)
				verts.push(new THREE.Vector3(j * tileD, hDisc, i * tileD))
			}
		}

		//get heights in sorted order
		var heightsArray = Array.from(heights)
		heightsArray.sort((a,b)=> {return a - b})
		console.log(heightsArray)

		var waterAlt = heightsArray[5]
		var treeAlt = [heightsArray[6], heightsArray[7]]
		var sparseTreeAlt = [heightsArray[8], heightsArray[11]]
		var snowAltFromTop = 3

		//push verts into geometry
		for(var i = 0; i < verts.length; i++){
			if(verts[i].y <= waterAlt)
				geom.vertices.push(new THREE.Vector3(verts[i].x, waterAlt, verts[i].z));
			else
				geom.vertices.push(verts[i]);
		}


		//snake a line through verts to create grid
		var lineMaterial = new THREE.LineBasicMaterial({color: 0xDF4949, linewidth: 10});
		var horizontalLineGeom = new THREE.Geometry();
		var verticalLineGeom = new THREE.Geometry();

		var count = 0
		var nextVert = -1;
		var goingRight = true

		while(count < mapD * mapD){
			if(goingRight && (nextVert + 1) % mapD == 0){
				nextVert += mapD
				goingRight = false
				count++
			}else if(!goingRight && nextVert % mapD == 0){
				nextVert += mapD
				goingRight = true
				count++
			}else{
				if(goingRight)
					nextVert++
				else
					nextVert--
			}

			horizontalLineGeom.vertices.push(geom.vertices[nextVert])
			count++
		}
		
		count = 0
		nextVert = 0;
		var goingDown = true
		verticalLineGeom.vertices.push(geom.vertices[0])

		while(count < mapD * mapD){
			if(goingDown && nextVert >= (mapD * (mapD - 1))){
				nextVert++
				goingDown = false
				count++
			}else if(!goingDown && nextVert < mapD){
				nextVert++
				goingDown = true
				count++
			}else{
				if(goingDown)
					nextVert += mapD
				else
					nextVert -= mapD
			}

			verticalLineGeom.vertices.push(geom.vertices[nextVert])

			count++
		}

		horizontalLineGeom.computeLineDistances();
		verticalLineGeom.computeLineDistances();
		// this.scene.add(new THREE.Line(horizontalLineGeom, lineMaterial));
		// this.scene.add(new THREE.Line(verticalLineGeom, lineMaterial));

		// for(var i = 0; i < geom.vertices.length; i++){
		// 	geom.vertices[i].y *= h2[i]
		// }

		//create faces
		var count = -1;
		for(var i = 0; i < (mapD * (mapD - 1)) - 1; i++){
			if((i + 1) % mapD == 0)
				continue

			// geom.vertices[i + mapD].y *= h2[i] 
			// geom.vertices[i + mapD + 1].y *= h2[i] 
			// geom.vertices[i].y *= h2[i] 
			// geom.vertices[i + 1].y *= h2[i] 

			var face1 = new THREE.Face3(i, i + mapD, i + 1)
			var face2 = new THREE.Face3(i + mapD, i + mapD + 1, i + 1)

			geom.faces.push(face1);
			geom.faces.push(face2);

			//calculate position of center of tile
			var cornerHeights = [
				geom.vertices[i].y,
				geom.vertices[i + mapD + 1].y,
				geom.vertices[i + 1].y,
				geom.vertices[i + mapD].y
			]
			var topleft = geom.vertices[i]
			var bottomright = geom.vertices[i + mapD + 1]
			var pos = new THREE.Vector3(
				(bottomright.x + topleft.x) / 2,
				(Math.max.apply(null, cornerHeights) + Math.min.apply(null, cornerHeights)) / 2,
				(bottomright.z + topleft.z) / 2)

			var index = i
			var tile = new Tile(face1, face2, index, pos, geom)
			face1.tile = tile
			face2.tile = tile

			tile.init(tile.grassColor)
			tile.fillInWater(waterAlt)
			tile.fillInSnow(heightsArray[heightsArray.length - snowAltFromTop - 1])

			this.tiles[++count] = tile
		}

		//calculate normals for faces
		geom.computeFaceNormals();
		for(var i in this.tiles){
			this.tiles[i].determineFlatness()
		}

		//center camera
		this.camera.position.x = (mapD * tileD) / 2
		this.camera.position.z = (mapD * tileD)
		this.camera.position.y = heightM * 6

		// this.terrain = new THREE.Mesh(geom, new THREE.MeshStandardMaterial());
		this.terrain = new THREE.Mesh(geom,
			new THREE.MeshPhongMaterial({
	        	wireframe: false, 
	        	shading: THREE.FlatShading, 
	        	vertexColors: THREE.VertexColors,
	        	shininess: 0
	        }));
		this.worldg.add(this.terrain);

		//add trees
		// h = perlin.generatePerlinNoise(mapD, mapD);
		for(var i in this.tiles){
			// if(this.tiles[i].flatFace){
			// if(this.tiles[i].position.y > treeAlt[0] 
			// 	&& this.tiles[i].position.y < treeAlt[1]
			// 	&& this.tiles[i].flatFace){
			// if(h[i] > 0.8){

			//thick forest
			if(this.tiles[i].position.y > treeAlt[0] 
				&& this.tiles[i].position.y < treeAlt[1]){
			
				var obj = this.assets["ctms/tree.ctm"].clone()

				obj.position.x = this.tiles[i].position.x
				obj.position.y = this.tiles[i].position.y
		        obj.position.z = this.tiles[i].position.z

		        // this.worldg.add(obj)
		    //sparse forest
			}else if(this.tiles[i].position.y > sparseTreeAlt[0] 
				&& this.tiles[i].position.y < sparseTreeAlt[1]
				&& this.tiles[i].flatFace){

				var obj = this.assets["ctms/tree.ctm"].clone()

				obj.position.x = this.tiles[i].position.x
				obj.position.y = this.tiles[i].position.y
		        obj.position.z = this.tiles[i].position.z

		        this.worldg.add(obj)
			}
		}

		// this.worldg.position.x -= (mapDActual * tileD) / 2
		// this.scene.position.x += (mapDActual * tileD) / 2

		// this.worldg.position.y -= (mapDActual * tileD) / 2
		// this.scene.position.y += (mapDActual * tileD) / 2

		// this.terrain.position.x += (mapDActual * tileD) / 2

		// for(var i = 0; i < this.terrain.geometry.vertices.length; i++){
	 //    	var vec = this.terrain.geometry.vertices[i]
	 //    	vec.x /= 100
	 //    	vec.y -= (mapD * tileD) / 2
	 //    	vec.z *= 6
	 //    	vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), (vec.x * 18) * (Math.PI / 180))
	 //    }
	 //    this.terrain.geometry.verticesNeedUpdate = true;
	}
	 
	update(){
		if(this.keyState['d']){
			this.camera.position.x += 10;
		}else if(this.keyState['a']){
			this.camera.position.x -= 10;
		}
		if(this.keyState['w']){
			this.camera.position.z -= 10;
		}else if(this.keyState['s']){
			this.camera.position.z += 10;
		}
		if(this.keyState['q']){
			Game.rotateGlobal(this.camera, new THREE.Vector3(0, 1, 0), 1)
		}else if(this.keyState['e']){
			Game.rotateGlobal(this.camera, new THREE.Vector3(0, 1, 0), -1)
		}
		if(this.keyState['zoomIn']){
			this.camera.position.y -= 50;
			this.keyState['zoomIn'] = false;
		}else if (this.keyState['zoomOut']){
			this.camera.position.y += 50;
			this.keyState['zoomOut'] = false;
		}

		// if(this.keyState['Lmouse']){
			
		// 	this.keyState['Lmouse'] = false;
		// }

		if(this.objthing !== undefined){
			this.objthing.rotation.z += 0.01;
			this.objthing.rotation.x += 0.01;
	    	this.objthing.rotation.y += 0.01;
		}

	    if(this.keyState['x']){
		    // for(var i = 0; i < this.terrain.geometry.vertices.length; i++){
		    // 	var vec = this.terrain.geometry.vertices[i]
		    // 	vec.x *= Math.random()
		    // 	// vec.applyAxisAngle(new THREE.Vector3(0,0,1), -i * (Math.PI / 180))
		    // 	this.terrain.geometry.verticesNeedUpdate = true;
		    // }

		    // this.tiles[8].select()
		    // this.terrain.geometry.colorsNeedUpdate = true;

		 //   if(this.currSelTile !== undefined){
			// 	var obj = this.assets["ctms/tree.ctm"].clone()

			// 	obj.position.x = this.currSelTile.position.x
			// 	obj.position.y = this.currSelTile.position.y
		 //        obj.position.z = this.currSelTile.position.z

		 //        this.worldg.add(obj)
			// }

			// Game.rotateGlobal(this.scene, new THREE.Vector3(0, 0, 1), 1)
			// this.terrain.rotation.z += -0.1 * (Math.PI / 180)
			this.worldg.rotation.z = -90 * (Math.PI / 180)
			// console.log(this.worldg.rotation)
		}

		// this.tileSelection();

		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(()=> {this.update()});
	}

	tileSelection(){
		//mouse selection
		this.raycaster.setFromCamera(this.mouse, this.camera);
		var intersects = this.raycaster.intersectObject(this.terrain);
		// var intersects = this.raycaster.intersectObjects(this.scene.children);
		for (var i = 0; i < intersects.length; i++) {
			if(intersects[0].object == this.terrain){
				var face = intersects[0].face

				if(this.currSelTile === undefined){
					face.tile.select()
					this.currSelTile = face.tile
				}else{
					this.currSelTile.deselect()
					this.currSelTile = face.tile
					face.tile.select()
				}

				this.terrain.geometry.colorsNeedUpdate = true;
			}
		}
	}

	static rotateLocal(object,degreeX, degreeY, degreeZ){
		degreeX = (degreeX * Math.PI)/180;
		degreeY = (degreeY * Math.PI)/180;
		degreeZ = (degreeZ * Math.PI)/180;

		object.rotateX(degreeX);
		object.rotateY(degreeY);
		object.rotateZ(degreeZ);
	}

	static rotateGlobal(object, axis, degrees) {
		var radians = degrees * Math.PI / 180

	    var rotWorldMatrix = new THREE.Matrix4();
	    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	    rotWorldMatrix.multiply(object.matrix); // pre-multiply
	    object.matrix = rotWorldMatrix;
	    object.rotation.setFromRotationMatrix(object.matrix)
	}
}

module.exports = Game;