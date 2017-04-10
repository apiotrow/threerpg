var THREE = require('three');
require('../three/CTMLoader.js')
var OrbitControls = require('three-orbitcontrols')

class Game {
	constructor(assets){
		this.appW = 800;
		this.appH = 600;
		this.titlebarheight = TITLEBARHEIGHT
		this.assets = assets;
		this.renderer = new THREE.WebGLRenderer({antialias: false});
		this.scene = new THREE.Scene();
	    this.camera = new THREE.PerspectiveCamera(75, this.appW / this.appH, 1, 10000);
	    // this.camera = new THREE.OrthographicCamera( -200, 200, 200, -200, -1000, 1000 );
	    this.worldg = new THREE.Group();
	    this.char = this.assets["assets/ctms/grundus.ctm"].clone()
	    this.camdist = 50;
	    this.charLine;

	    this.renderer.setSize(this.appW, this.appH);
	    document.body.appendChild(this.renderer.domElement);
	    this.scene.background = new THREE.Color(0x000000);
	    this.camera.position.z = 300;
	    this.camera.position.y = 300;
	    Game.rotateLocal(this.camera, -36, 0, 0)

	 //    var controls = new OrbitControls( this.camera, this.renderer.domElement );
	 //    controls.enableDamping = true
		// controls.dampingFactor = 0.25
		// controls.enableZoom = false
	    
	    this.char.castShadow = true;
	    this.scene.add(this.char);

	    this.guygroup = new THREE.Group();
	    this.char.add(this.guygroup);

	    this.cube = new THREE.Mesh(new THREE.CubeGeometry(4,4,4), new THREE.MeshNormalMaterial());
    	this.guygroup.add(this.cube);
    	this.cube.position.set(this.char.position.x - 0.5, this.char.position.y + 0.5, this.char.position.z + 17)

    	this.char.position.set(-200, 120, 0)
    	// this.cube.position.set(this.getCenterPoint(this.char))
	    // rayOrigin = new THREE.Vector3(char.position.x, char.position.y + box.max.y, char.position.z)


	    this.renderer.shadowMap.enabled = true;
		// this.renderer.shadowMapSoft = true;
		// this.renderer.shadowCameraNear = 3;
		// this.renderer.shadowCameraFar = this.camera.far;
		// this.renderer.shadowCameraFov = 0;
		// this.renderer.shadowMapBias = 0.0039;
		// this.renderer.shadowMapDarkness = 0.5;
		// this.renderer.shadowMapWidth = 1024;
		// this.renderer.shadowMapHeight = 1024;

        this.land = this.assets["assets/ctms/land.ctm"].clone()
		var land = this.land;
		this.land.receiveShadow = true;
		land.scale.x = 50
		land.scale.y = 50
		land.scale.z = 50
		land.position.set(-150,-50,0)
		this.scene.add(land);

 		this.raycaster = new THREE.Raycaster()
		this.mouse = new THREE.Vector2()

		//lights
		var light;
		light = new THREE.DirectionalLight(0xffffff, 0.5);
	    light.position.set(-1000, 1000, 500)
	    light.target.position.set(0, 0, 0);
	    light.castShadow = true;
	    light.shadow.camera.near = 0;
		light.shadow.camera.far = 5000;
		light.shadow.camera.left = -100;
		light.shadow.camera.right = 100;
		light.shadow.camera.top = 100;
		light.shadow.camera.bottom = -100;
	    this.scene.add(light);
	    this.dirlight = light;
	    light = new THREE.AmbientLight(0x8C8C8C, 1);
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

		window.addEventListener( 'mousemove', (e)=>{
			e.preventDefault();
			this.mouse.x = (e.clientX / this.appW) * 2 - 1;
			this.mouse.y = -((e.clientY - this.titlebarheight) / this.appH) * 2 + 1;
		}, false );

		this.qtt = 0;

		this.update();
	}
	 
	update() {
		var camera = this.camera
		var keyState = this.keyState
		var scene = this.scene
		var renderer = this.renderer
		var mouse = this.mouse;
		var char = this.char;
		
		if(keyState['d']){
			// Game.rotateGlobal(char, new THREE.Vector3(0, 1, 0), -2)
			Game.rotateLocal(char, 0, 0, -3)
		}else if(keyState['a']){
			// Game.rotateGlobal(char, new THREE.Vector3(0, 1, 0), 2)
			Game.rotateLocal(char, 0, 0, 3)
		}
		if(keyState['w']){
			char.translateY(-1)
		}else if(keyState['s']){
			char.translateY(1)
		}
		if(keyState['zoomIn']){
			this.camdist -= 3;
			keyState['zoomIn'] = false;
		}else if (keyState['zoomOut']){
			this.camdist += 3;
			keyState['zoomOut'] = false;
		}

		var charpos = new THREE.Vector3(char.position.x, char.position.y, char.position.z)
		// camera.position.set(char.position.x, char.position.y + this.camdist, char.position.z + this.camdist)
		camera.lookAt(char.position)

		// this.dirlight.position.set(char.position.x, char.position.y + this.camdist, char.position.z + this.camdist)

		if(this.land !== undefined){
			// this.land.rotation.z += 0.01;
			// this.land.rotation.x += 0.001;
	    	// this.land.rotation.y += 0.01;
		}

	    if(keyState['x']){
		    var obj = this.assets["assets/ctms/house2.ctm"].clone()
			obj.position.x = (Math.random() * 1000) - 500
			obj.position.z = -(Math.random() * 1000)
			scene.add( obj)
		}

		renderer.render(scene, camera);
		this.raycaster.setFromCamera(mouse, camera);
		var intersects = this.raycaster.intersectObjects(scene.children);
		for (var i = 0; i < intersects.length; i++) {
			// intersects[0].object.material.color.set(0xff0000);
			// intersects[0].object.position.x += 1
		}


		var box = new THREE.Box3().setFromObject(char);
		var rayOrigin = new THREE.Vector3(char.position.x, char.position.y + (box.getSize().y / 2), char.position.z)
		var ray = new THREE.Raycaster()
		ray.set(rayOrigin, new THREE.Vector3(0, -1, 0));
		var collision = ray.intersectObject(this.land);
		if(collision[0] !== undefined){
			char.position.y = collision[0].point.y
		}

		var material = new THREE.LineBasicMaterial({
			color: 0x0000ff
		});
		var geometry = new THREE.Geometry();
		var v1 = new THREE.Vector3();
		// v1.add(char.up);
		// char.updateMatrixWorld();
		v1.copy(char.up).applyQuaternion(char.quaternion);
		// rayOrigin = new THREE.Vector3(char.position.x, ((box.max.y + box.min.y) / 2), char.position.z)
		// rayOrigin = new THREE.Vector3(char.position.x, char.position.y + box.max.y, char.position.z)
		var pLocal = new THREE.Vector3( 0, 0, -1 );
		var pWorld = pLocal.applyMatrix4(char.matrixWorld);
		var dir = pWorld.sub(char.position).normalize();
		// vector.setFromMatrixPosition(this.cube.matrixWorld);

		var charCenter = this.getCenterPoint(char);
		//forward
		geometry.vertices.push(
			charCenter,
			new THREE.Vector3().addVectors(charCenter, v1.multiplyScalar(-9))
		);

		//down
		geometry.vertices.push(
			charCenter,
			new THREE.Vector3().addVectors(charCenter, dir.multiplyScalar(19))
			// new THREE.Vector3().addVectors(this.getCenterPoint(char), dir.multiplyScalar(19))
			// dir
		);

		var cc = new THREE.Vector3();
		cc.copy(charCenter).sub(new THREE.Vector3().addVectors(charCenter, dir)).normalize()
		
		scene.remove(this.charLine)
		this.charLine = new THREE.Line(geometry, material);
		scene.add(this.charLine);

		ray.set(charCenter, new THREE.Vector3().addVectors(charCenter, dir.multiplyScalar(19)));
		var collision = ray.intersectObject(this.land);
		if(collision[0] !== undefined){
			// char.position.y = collision[0].point.y
			// console.log(collision[0])

			var newDir = collision[0].face.normal
			var pos = new THREE.Vector3();
			pos.addVectors(newDir, char.position);

			// console.log(cc, newDir)
			newDir.x = -newDir.x
			newDir.y = -newDir.y
			newDir.z = -newDir.z

			var qt = new THREE.Quaternion();
			qt.setFromUnitVectors(cc, newDir)
			// console.log(qt)
			// char.setRotationFromQuaternion(qt)
			// char.lookAt(pos);
			// char.rotation.set(pos)
			// char.up.set(newDir.normalize())d
			// console.log(char.up)
			// char.up.set(charCenter.x + newDir.x, charCenter.y + newDir.y, charCenter.z + newDir.z);

			
			// char.lookAt(new THREE.Vector3(charCenter.x + newDir.x, charCenter.y + newDir.y, charCenter.z + newDir.z));

			// if(char.up != newDir){
			// 	char.up.set(newDir.x, newDir.y, newDir.z);
			// 	// var h = new THREE.Vector3().addVectors(charCenter, v1)
			// 	// char.lookAt(this.cube.position.x, this.cube.position.y, this.cube.position.z);
			// 	char.lookAt(new THREE.Vector3(0, 0, 1))
			// }

			// var newPoint = new THREE.Vector3(
			//     char.position.y + newDir.x,
			//     char.position.z + newDir.y,
			//     char.position.x + newDir.z
			// );

			
		}

		// char.up = new THREE.Vector3(charCenter.x + 0, charCenter.y + 0, charCenter.z + 1 ).normalize();//Z axis up
		// console.log(newDir)
		// char.lookAt(new THREE.Vector3( 0, 0, 1 )); 



		var vec = new THREE.Vector3(1, 1, 1);
		// vec.applyEuler(char.getWorldRotation())
		vec.applyQuaternion(char.getWorldQuaternion())
		// var qt = new THREE.Quaternion();
		// qt.x = 0
		// qt.y = 1
		// qt.z = 0
		// qt.w = 0

		
		// var vv1 = new THREE.Vector3().addVectors(charCenter, v1).normalize()
		// var vv1 = new THREE.Vector3(0.7, 0, 0.7).normalize()
		// var vv1 = new THREE.Vector3(0, 0, 1).normalize()
		// var vv2 = new THREE.Vector3(1, 0, 0).normalize()
		// qt.setFromUnitVectors(vv1, vv2)

		// char.setRotationFromQuaternion(qt)


		



		// var matrix = new THREE.Matrix4()
		// var axis = new THREE.Vector3()
		// axis.crossVectors(vv1, vv2); 
		// console.log(axis)

		// var angle = vv1.angleTo( vv2 );
		// matrix.makeRotationAxis( axis, angle )
		// char.applyMatrix( matrix );

		// var eul = new THREE.Euler(4, 0, 0, 'XYZ');
		// console.log(char.getWorldQuaternion())
		// console.log(char.getWorldRotation())
		// console.log(qt)
		
		// char.setRotationFromEuler(eul)

		// char.up.set(0, 0, 1);
		// char.up.set(0.7, 0, 0.7);
		// char.lookAt(new THREE.Vector3(0, 0, 1))
		// char.setRotationFromAxisAngle(new THREE.Vector3(0.7, 0, 0.7), 90 * Math.PI / 180);

		// scene.updateMatrixWorld();
		// var vector = new THREE.Vector3();
		// vector.setFromMatrixPosition( this.cube.matrixWorld );
		// var cubeWorld = child.localToWorld( parent.position )
		// char.lookAt(vector.x, vector.y, vector.z);

		if(keyState['q']){
			if(collision[0] !== undefined)
				console.log(collision[0].face.normal)

			this.qtt -= 0.1
		}else if(keyState['e']){
			Game.rotateLocal(this.land, 1, 0, 0)
			// this.char.remove(this.cube)
			// Game.rotateAroundObjectAxis(this.guygroup, new THREE.Vector3(0, 0, 1), 1)
			// this.char.add(this.cube)
			// Game.rotateGlobal(char, new THREE.Vector3(1, 0, 0), 1)
			// console.log(this.getCenterPoint(char))

			// char.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), 270 * Math.PI / 180);
			this.qtt += 0.1
		}

		

		

		

		requestAnimationFrame(()=> {this.update()});
	}

	getCenterPoint(mesh) {
	    var middle = new THREE.Vector3();
	    var geometry = mesh.geometry;

	    geometry.computeBoundingBox();

	    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
	    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
	    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

	    mesh.localToWorld( middle );
	    return middle;
	}

	static rotateLocal(object, degreeX, degreeY, degreeZ){
		degreeX = (degreeX * Math.PI) / 180;
		degreeY = (degreeY * Math.PI) / 180;
		degreeZ = (degreeZ * Math.PI) / 180;

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

	static rotateAroundObjectAxis( object, axis, degrees ) {
		var radians = degrees * Math.PI / 180

	    var rotationMatrix = new THREE.Matrix4();
	    rotationMatrix.makeRotationAxis( axis.normalize(), radians );
	    object.matrix.multiply( rotationMatrix );                       // post-multiply
	    object.rotation.setFromRotationMatrix(object.matrix, object.order);
	}
}

module.exports = Game;