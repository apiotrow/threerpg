var THREE = require('three');

class Tile {
	constructor(face1, face2, index, pos){
		this.face1 = face1
		this.face2 = face2
		this.index = index
		this.position = pos
		this.flatFace = false
		this.initColor = 0x00ff00
		this.selectColor = 0xff0000;
		this.flatColor = 0x0000ff;
	}

	init(){
		this.initFacesColors(this.initColor)
	}

	highlightFlatFaces(){
		if(this.face1.normal.y == 1 && this.face2.normal.y == 1){
			this.initFacesColors(this.flatColor)
		}
	}

	select(){
		this.changeFacesColors(this.selectColor)
	}

	deselect(){
		this.changeFacesColors(this.initColor)
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