var THREE = require('three');
require('./CTMLoader.js')


class Game {
	contructor(){
		var _this = this;
		this.objthing;
		this.objscalechange = 30;
		this.dirLight;
		this.pose
		this.things;

		this.things = new THREE.CTMLoader()

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.appW = 800;
		this.appH = 600;
	    this.renderer.setSize(this.appW, this.appH);

	    this.scene = new THREE.Scene();
	    this.scene.background = new THREE.Color(0x000000);
	 
	    this.camera = new THREE.PerspectiveCamera(75, this.appW / this.appH, 1, 10000);
	    // this.camera = new THREE.OrthographicCamera( -200, 200, 200, -200, -1000, 1000 );
	    this.camera.position.z = 300;
	    this.camera.position.y = 300;
	    this.rotateLocal(this.camera, -36, 0, 0)

		for(var i = 0; i < 20; i++){
	    	this.things.load("assets/ctms/bugsports.ctm", function(geometry) {
		        var material = new THREE.MeshPhongMaterial({
		        	wireframe: false, 
		        	shading: THREE.FlatShading, 
		        	vertexColors: THREE.VertexColors,
		        	shininess: 0
		        });

		        geometry.computeFaceNormals();
		        geometry.computeVertexNormals();

		        _this.objthing = new THREE.Mesh(geometry, material);

		        _this.objthing.position.x = (Math.random() * 1000) - 500
		        _this.objthing.position.z = -(Math.random() * 1000)

		        _this.rotateLocal(_this.objthing, -90, 0, 0)

		        _this.scene.add(_this.objthing);
		    })
		}

		this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
	    // this.dirLight.position = this.camera.position;
	    this.dirLight.position.x += 400;
	    this.dirLight.position.z += 400;
	    this.dirLight.castShadow = true;
	    this.scene.add( this.dirLight );

	    var light = new THREE.AmbientLight(0x8C8C8C);
	 	this.scene.add(light);
	 
	    document.body.appendChild(this.renderer.domElement);

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


		var FPS = 60;
		setInterval(function() {
		    _this.animate();
		}, 1000/FPS);
	}
	 
	animate() {
		var _this = this;

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
			rotateGlobal(this.camera, new THREE.Vector3(0, 1, 0), 1)
		}else if(this.keyState['e']){
			rotateGlobal(this.camera, new THREE.Vector3(0, 1, 0), -1)
		}
		if(this.keyState['zoomIn']){
			this.camera.position.y -= 10;
			this.keyState['zoomIn'] = false;
		}else if (this.keyState['zoomOut']){
			this.camera.position.y += 10;
			this.keyState['zoomOut'] = false;
		}


		if(this.objthing !== undefined){
			this.objthing.rotation.z += 0.01;
			// this.objthing.rotation.x += 0.01;
	    	// this.objthing.rotation.y += 0.02;
		}

	    // requestAnimationFrame(this.animate);
	    this.renderer.render(this.scene, this.camera);

	    if(this.keyState['x']){
		    var obj = this.objthing.clone()
			obj.position.x = (Math.random() * 1000) - 500
			obj.position.z = -(Math.random() * 1000)
			this.scene.add( obj)
		    this.keyState['x'] = false;
		}
	}

	rotateLocal(object,degreeX, degreeY, degreeZ){
		degreeX = (degreeX * Math.PI)/180;
		degreeY = (degreeY * Math.PI)/180;
		degreeZ = (degreeZ * Math.PI)/180;

		object.rotateX(degreeX);
		object.rotateY(degreeY);
		object.rotateZ(degreeZ);
	}

	rotateGlobal(object, axis, degrees) {
		var radians = degrees * Math.PI / 180

	    rotWorldMatrix = new THREE.Matrix4();
	    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	    rotWorldMatrix.multiply(object.matrix); // pre-multiply
	    object.matrix = rotWorldMatrix;
	    object.rotation.setFromRotationMatrix(object.matrix)
	}
}

module.exports = Game;