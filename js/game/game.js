var THREE = require('three');
require('../three/CTMLoader.js')
var perlin = require('perlin-noise');

class Game {
	constructor(assets){
		this.appW = 800;
		this.appH = 600;
		this.assets = assets;
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

	    var assetArray = Object.keys(this.assets)

		// for(var i = 0; i < 50; i++){
		// 	var randAsset = assetArray[Math.floor(Math.random() * assetArray.length)]
		// 	var obj = this.assets[randAsset].clone()

	 //        obj.position.x = (Math.random() * 1000) - 500
	 //        obj.position.z = -(Math.random() * 1000)

	 //        this.worldg.add(obj)
	 //        this.scene.add(obj);
		// }

		var light

		light = new THREE.DirectionalLight(0xffffff, 1);
	    light.position.set(-1, 1, 0.5)
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

		this.update();
	}

	generateTerrain(){
		var geom = new THREE.Geometry();

		var mapD = 100;

		var h = perlin.generatePerlinNoise(mapD, mapD);

		console.log(h.length)

		for(var i = 0; i < mapD; i++){
			for(var j = 0; j < mapD; j++){
				geom.vertices.push(new THREE.Vector3(j * 10, h[(i * 10) + j] * 40, i * 10));
			}
		}

		for(var i = 0; i < (mapD * (mapD - 1)) - 1; i++){
			if((i + 1) % mapD == 0)
				continue

			geom.faces.push(new THREE.Face3(i, i + mapD, i + 1));
			geom.faces.push(new THREE.Face3(i + mapD, i + mapD + 1, i + 1));

			// geom.faces.push(new THREE.Face3(i, i + 1, i + mapD));
			// if(i + 1 + mapD < mapD * mapD)
			// geom.faces.push(new THREE.Face3(i + 1, i + 1 + mapD, i + mapD));
		}


		// var v1 = new THREE.Vector3(0,0,0);
		// var v2 = new THREE.Vector3(0,0,50);
		// var v3 = new THREE.Vector3(50,0,50);
		// geom.vertices.push(v1);
		// geom.vertices.push(v2);
		// geom.vertices.push(v3);
		// geom.faces.push(new THREE.Face3(0, 1, 2));

		geom.computeFaceNormals();

		var terrain = new THREE.Mesh(geom, new THREE.MeshNormalMaterial());
		this.scene.add(terrain);
	}
	 
	update() {
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
		    var obj = this.assets[0].clone()
			obj.position.x = (Math.random() * 1000) - 500
			obj.position.z = -(Math.random() * 1000)
			scene.add( obj)
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