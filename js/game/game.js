var THREE = require('three');
require('../three/CTMLoader.js')
var perlin = require('perlin-noise');
var Tile = require('./tile.js')

class Game {
	constructor(assets){
		this.appW = 800;
		this.appH = 600;
		this.assets = assets;
		this.titlebarheight = TITLEBARHEIGHT
		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.scene = new THREE.Scene();
	    this.camera = new THREE.PerspectiveCamera(75, this.appW / this.appH, 1, 10000);
	    // this.camera = new THREE.OrthographicCamera( -200, 200, 200, -200, -1000, 1000 );
	    this.worldg = new THREE.Group();

	    this.renderer.setSize(this.appW, this.appH);
	    document.body.appendChild(this.renderer.domElement);
	    this.scene.background = new THREE.Color(0x000000);
	    this.camera.position.z = 300;
	    this.camera.position.y = 300;
	    Game.rotateLocal(this.camera, -36, 0, 0)

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

		for(var i = 0; i < 50; i++){
			var randAsset = assetArray[Math.floor(Math.random() * assetArray.length)]
			var obj = this.assets[randAsset].clone()

	        obj.position.x = (Math.random() * 1000) - 500
	        obj.position.z = -(Math.random() * 1000)

	        this.worldg.add(obj)
	        this.scene.add(obj);
		}

		var light

	    light = new THREE.DirectionalLight(0xffffff, 0.5);
	    light.position.set(0.7, 1, -0.5)
	    light.target.position.set(0, 0, 0);
	    light.castShadow = true;
	    this.scene.add(light);
	    
	    light = new THREE.AmbientLight(0x8C8C8C);
	 	this.scene.add(light);

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

		this.generateTerrain();
		// this.generateSquareTerrain();

		this.update();
	}

	generateSquareTerrain(){
		var geom = new THREE.Geometry();


	}

	generateTerrain(){
		var geom = new THREE.Geometry();

		var mapD = 10
		var tileD = 10
		var heightM = 80

		var h = perlin.generatePerlinNoise(mapD, mapD);

		//push vertices into geometry
		for(var i = 0; i < mapD; i++){
			for(var j = 0; j < mapD; j++){
				var index = (i * mapD) + j

				var hCont = h[index] * heightM;

				var hDiscLevels = 7;
				var hDisc = (Math.floor(h[index] * hDiscLevels) * heightM) / hDiscLevels;

				geom.vertices.push(new THREE.Vector3(j * tileD, hDisc, i * tileD));
			}
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


		//create faces
		for(var i = 0; i < (mapD * (mapD - 1)) - 1; i++){
			if((i + 1) % mapD == 0)
				continue

			var face1 = new THREE.Face3(i, i + mapD, i + 1)
			var face2 = new THREE.Face3(i + mapD, i + mapD + 1, i + 1)

			var index = i + j
			var tile = new Tile(face1, face2, index)
			face1.tile = tile
			face2.tile = tile
			tile.init()

			this.tiles[index] = tile

			geom.faces.push(face1);
			geom.faces.push(face2);
		}

		console.log(this.tiles)

		//center camera
		this.camera.position.x = (mapD * tileD) / 2
		this.camera.position.z = (mapD * tileD)
		this.camera.position.y = heightM * 2

		geom.computeFaceNormals();

		// this.terrain = new THREE.Mesh(geom, new THREE.MeshStandardMaterial());
		this.terrain = new THREE.Mesh(geom,
			new THREE.MeshPhongMaterial({
	        	wireframe: false, 
	        	shading: THREE.FlatShading, 
	        	vertexColors: THREE.VertexColors,
	        	shininess: 0
	        }));
		this.scene.add(this.terrain);
	}
	 
	update(){
		var cam = this.camera
		var keyState = this.keyState
		var scene = this.scene
		var renderer = this.renderer

		if(keyState['d']){
			cam.position.x += 10;
		}else if(keyState['a']){
			cam.position.x -= 10;
		}
		if(keyState['w']){
			cam.position.z -= 10;
		}else if(keyState['s']){
			cam.position.z += 10;
		}
		if(keyState['q']){
			Game.rotateGlobal(cam, new THREE.Vector3(0, 1, 0), 1)
		}else if(keyState['e']){
			Game.rotateGlobal(cam, new THREE.Vector3(0, 1, 0), -1)
		}
		if(keyState['zoomIn']){
			cam.position.y -= 10;
			keyState['zoomIn'] = false;
		}else if (keyState['zoomOut']){
			cam.position.y += 10;
			keyState['zoomOut'] = false;
		}

		if(this.objthing !== undefined){
			this.objthing.rotation.z += 0.01;
			this.objthing.rotation.x += 0.01;
	    	this.objthing.rotation.y += 0.01;
		}

	    if(keyState['x']){
		    for(var i = 0; i < this.terrain.geometry.vertices.length; i++){
		    	var vec = this.terrain.geometry.vertices[i]
		    	vec.x *= Math.random()
		    	this.terrain.geometry.verticesNeedUpdate = true;
		    }
		}

		//mouse selection
		this.raycaster.setFromCamera(this.mouse, cam);
		var intersects = this.raycaster.intersectObjects(scene.children);
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

		renderer.render(scene, cam);

		requestAnimationFrame(()=> {this.update()});
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