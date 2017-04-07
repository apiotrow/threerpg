document.addEventListener('DOMContentLoaded', function () {
	var THREE = require('three');
	var ply = require('./PlYLoader.js');
	// var fbx = require('./FBXLoader.js')
	// var bin = require('./BinaryLoader.js')
	// var obj = require('./OBJLoader.js')
	var gg = require("./ass/ass.json")
	var spriter = require("./ass/spriter")
	// var rendewebgl = require("./ass/render-webgl")
	// var dae = require('./ColladaLoader.js')
	var ctm = require('./CTMLoader.js')
	var draco = require('./DRACOLoader.js')


	init();
	animate();
	var objthing;
	var objscalechange = 30;
	var dirLight;
	var pose
	var camera;
	 
	function init() {
		renderer = new THREE.WebGLRenderer({antialias: true});
	    renderer.setSize(600, 600);

		var data = new spriter.Data().load(gg);
		pose = new spriter.Pose(data);
		pose.setEntity("entity_000"); // set entity by name
		pose.setAnim("NewAnimation");

	    scene = new THREE.Scene();
	    scene.background = new THREE.Color(0xffffff);
	 
	    camera = new THREE.PerspectiveCamera(75, 1 / 1, 1, 10000);
	    camera.position.z = 300;
	    camera.position.y = 300;
	    rotateObject(camera, -30, 0, 0)

	 
	    // geometry = new THREE.BoxGeometry( 200, 200, 200 );
	    // material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	 
	    // mesh = new THREE.Mesh( geometry, material );
	    // scene.add( mesh );



		// new THREE.FBXLoader(  ).load( 'deezeranimascii.fbx', function( object ) {
		// 	object.material = new THREE.MeshPhongMaterial({
	 //        	wireframe: false, 
	 //        	shading: THREE.FlatShading, 
	 //        	vertexColors: THREE.VertexColors,
	 //        	shininess   : 0, 
	 //        });

	 //        object.scale.x = objscalechange
	 //        object.scale.y = objscalechange
	 //        object.scale.z = objscalechange


		// 	scene.add( object );
		// });

		// new THREE.OBJLoader(  ).load( 'deezerobj.obj', function( object ) {
		// 	object.material = new THREE.MeshPhongMaterial({
	 //        	wireframe: false, 
	 //        	shading: THREE.FlatShading, 
	 //        	vertexColors: THREE.VertexColors,
	 //        	shininess   : 0, 
	 //        });

	 //        object.texturePath ='deezerobj.png';
		// 	// object.mixer = new THREE.AnimationMixer( object );
		// 	// mixers.push( object.mixer );
		// 	// var action = object.mixer.clipAction( object.animations[ 0 ] );
		// 	// action.play();
	        // object.scale.x = objscalechange
	        // object.scale.y = objscalechange
	        // object.scale.z = objscalechange
		// 	scene.add( object );
		// });

		var things = new THREE.CTMLoader()
		// var dracoLoader = new THREE.DRACOLoader();

		for(var i = 0; i < 15; i++){
	    	things.load("obj_house5.ctm", function(geometry) {
		        var material = new THREE.MeshPhongMaterial({
		        	wireframe: false, 
		        	shading: THREE.FlatShading, 
		        	vertexColors: THREE.VertexColors,
		        	shininess   : 0, 
		        });

		        geometry.computeFaceNormals();
		        geometry.computeVertexNormals();

		        objthing = new THREE.Mesh( geometry, material );

		        // objthing.scale.x = objscalechange
		        // objthing.scale.y = objscalechange
		        // objthing.scale.z = objscalechange

		        objthing.position.x = (Math.random() * 1000) - 500
		        objthing.position.z = -(Math.random() * 1000)

		        rotateObject(objthing, -90, 0, 0)

		        scene.add( objthing);
		    })

		    
          
		}



		// var loader = new THREE.CTMLoader();
		// loader.load('house2.ctm', function(geometry){
		// 	var material = new THREE.MeshPhongMaterial({
		//         	wireframe: false, 
		//         	shading: THREE.FlatShading, 
		//         	vertexColors: THREE.VertexColors,
		//         	shininess   : 0, 
		//         });
		// 	model = new THREE.Mesh( geometry, material );
		// 	// model.scale.set(0.5,0.5,0.5);
		// 	scene.add( model );

		// 	// model.scale.x = objscalechange
	 //  //       model.scale.y = objscalechange
	 //  //       model.scale.z = objscalechange

	 //        console.log(model)
		// })

		dirLight = new THREE.DirectionalLight( 0xffffff, 1);
	    dirLight.position = camera.position;
	    dirLight.position.x += 400;
	    dirLight.position.z += 400;
	    // dirLight.target = objthing;
	    dirLight.castShadow = true;
	    scene.add( dirLight );

	    var light = new THREE.AmbientLight(0x8C8C8C);
	 	scene.add(light);
	 
	    document.body.appendChild( renderer.domElement );

	    this.keyState = {};
	    window.addEventListener('keydown', (e)=>{
			this.keyState[e.key] = true;
		},true);	
		window.addEventListener('keyup', (e)=>{
			this.keyState[e.key] = false;
		},true);
		window.addEventListener('wheel', (e)=>{
			if(!this.overMenu){
				if(e.deltaY < 0){
					this.keyState['zoomIn'] = true;
				}
				else if(e.deltaY > 0){
					this.keyState['zoomOut'] = true;
				}
			}else{
				this.currMenuBtn.scroll(e.deltaY) //scroll menu item
			}
		}, {passive: true});
	}
	 
	function animate() {
		var dt = 1000 / 60; // time step in milliseconds
		pose.update(dt); // accumulate time
		pose.strike(); // process time slice

		if(this.keyState['d']){
			camera.position.x += 10;
		}else if(this.keyState['a']){
			camera.position.x -= 10;
		}
		if(this.keyState['w']){
			camera.position.z -= 10;
		}else if(this.keyState['s']){
			camera.position.z += 10;
		}
		if(this.keyState['q']){
			rotateObject(camera, 0, 1, 0)
		}else if(this.keyState['e']){
			rotateObject(camera, 0, -1, 0)
		}
		if(this.keyState['zoomIn']){
			camera.position.y -= 10;
			this.keyState['zoomIn'] = false;
		}else if (this.keyState['zoomOut']){
			camera.position.y += 10;
			this.keyState['zoomOut'] = false;
		}


		if(objthing !== undefined){
			objthing.rotation.z += 0.01;
			// objthing.rotation.x += 0.01;
	  //   	objthing.rotation.y += 0.02;
		}

	    requestAnimationFrame( animate );
	    renderer.render( scene, camera );
	}

	function rotateObject(object,degreeX, degreeY, degreeZ){
		degreeX = (degreeX * Math.PI)/180;
		degreeY = (degreeY * Math.PI)/180;
		degreeZ = (degreeZ * Math.PI)/180;

		object.rotateX(degreeX);
		object.rotateY(degreeY);
		object.rotateZ(degreeZ);
	}
})