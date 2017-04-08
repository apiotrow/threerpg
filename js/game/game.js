var THREE = require('three');
require('../three/CTMLoader.js')

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

		for(var i = 0; i < 20; i++){
			var obj = this.assets[1].clone()

	        obj.position.x = (Math.random() * 1000) - 500
	        obj.position.z = -(Math.random() * 1000)

	        this.worldg.add(obj)
	        this.scene.add(obj);
		}

		console.log(this.worldg)

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

		this.update();
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