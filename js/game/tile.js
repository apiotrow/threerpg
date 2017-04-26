var THREE = require('three');

class Tile {
	constructor(face1, face2, index){
		this.face1 = face1
		this.face2 = face2
		this.index = index
		this.initColor = 0x00ff00
		this.selectColor = 0xff0000;
	}

	select(){
		this.face1.vertexColors[0].setHex(this.selectColor)
		this.face1.vertexColors[1].setHex(this.selectColor)
		this.face1.vertexColors[2].setHex(this.selectColor)
		this.face2.vertexColors[0].setHex(this.selectColor)
		this.face2.vertexColors[1].setHex(this.selectColor)
		this.face2.vertexColors[2].setHex(this.selectColor)
	}

	init(){
		this.face1.vertexColors[0] = new THREE.Color(this.initColor)
		this.face1.vertexColors[1] = new THREE.Color(this.initColor)
		this.face1.vertexColors[2] = new THREE.Color(this.initColor)
		this.face2.vertexColors[0] = new THREE.Color(this.initColor)
		this.face2.vertexColors[1] = new THREE.Color(this.initColor)
		this.face2.vertexColors[2] = new THREE.Color(this.initColor)
	}

	deselect(){
		this.face1.vertexColors[0].setHex(this.initColor)
		this.face1.vertexColors[1].setHex(this.initColor)
		this.face1.vertexColors[2].setHex(this.initColor)
		this.face2.vertexColors[0].setHex(this.initColor)
		this.face2.vertexColors[1].setHex(this.initColor)
		this.face2.vertexColors[2].setHex(this.initColor)
	}
}

module.exports = Tile;