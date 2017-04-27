var THREE = require('three');

class Tile {
	constructor(face1, face2, index, pos, geom){
		this.face1 = face1
		this.face2 = face2
		this.index = index
		this.position = pos
		this.flatFace = false
		this.grassColor = 0x00ff00
		this.selectColor = 0xff0000;
		this.waterColor = 0x0000ff;
		this.snowColor = 0xffffff

		this.face1y = (
			geom.vertices[face1.a].y + 
			geom.vertices[face1.b].y + 
			geom.vertices[face1.c].y
			) / 3
		this.face2y = (
			geom.vertices[face2.a].y + 
			geom.vertices[face2.b].y + 
			geom.vertices[face2.c].y
			) / 3
	}

	init(color){
		this.initFacesColors(color)
	}

	fillInSnow(height){
		for(var i = 0; i < 3; i++){
			if(this.face1y > height)
				this.face1.vertexColors[i] = new THREE.Color(this.snowColor)
		}
		for(var i = 0; i < 3; i++){
			if(this.face2y > height)
				this.face2.vertexColors[i] = new THREE.Color(this.snowColor)
		}
	}

	fillInWater(height){
		for(var i = 0; i < 3; i++){
			if(this.face1y == height)
				this.face1.vertexColors[i] = new THREE.Color(this.waterColor)
		}
		for(var i = 0; i < 3; i++){
			if(this.face2y == height)
				this.face2.vertexColors[i] = new THREE.Color(this.waterColor)
		}
	}

	highlightFlatFaces(){
		if(this.face1.normal.y == 1 && this.face2.normal.y == 1){
			this.initFacesColors(this.waterColor)
		}
	}

	select(){
		this.changeFacesColors(this.selectColor)
	}

	deselect(){
		this.changeFacesColors(this.grassColor)
	}

	initFacesColors(color){
		for(var i = 0; i < 3; i++){
			this.face1.vertexColors[i] = new THREE.Color(color)
		}
		for(var i = 0; i < 3; i++){
			this.face2.vertexColors[i] = new THREE.Color(color)
		}
	}

	changeFacesColors(color){
		for(var i = 0; i < 3; i++){
			this.face1.vertexColors[i].setHex(color)
		}
		for(var i = 0; i < 3; i++){
			this.face2.vertexColors[i].setHex(color)
		}
	}

	determineFlatness(){
		if(this.face1.normal.y == 1 && this.face2.normal.y == 1){
			this.flatFace = true
		}
	}
}

module.exports = Tile;