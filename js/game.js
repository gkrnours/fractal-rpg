document.addEventListener("DOMContentLoaded", start)
function start() {
	var ratio = window.innerWidth/window.innerHeight
	var scene = new THREE.Scene()
	var camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 1000)
	camera.position.z = 10
	camera.position.x = 5
	camera.position.y = 2
	camera.lookAt({x:5,y:0,z:5})

	var renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth/1, window.innerHeight/1, false)
	document.body.appendChild(renderer.domElement)

	update = setup(scene)
	render(renderer, scene, camera)
}

function setup(scene) {
	var geometry = new THREE.BoxGeometry(1, 1, 1)
	var material = new THREE.MeshBasicMaterial({color: 0x00ff00})
	var cube = new THREE.Mesh(geometry, material)
	scene.add(cube)

	var grass = new THREE.TextureLoader().load("img/grass.png")
	grass.magFilter = THREE.NearestFilter
	grass.wrapS = THREE.RepeatWrapping
	grass.wrapT = THREE.RepeatWrapping
	grass.repeat.set(5, 5)
	var ground_geometry = new THREE.PlaneGeometry(10, 10)
	var ground_material = new THREE.MeshBasicMaterial({map:grass})
	var ground = new THREE.Mesh(ground_geometry, ground_material)
	ground.position.x = 5
	ground.position.z = 5
	ground.rotation.x = Math.PI*1.5
	scene.add(ground)

	var pitch = new THREE.TextureLoader().load("img/pitch.png")
	pitch.magFilter = THREE.NearestFilter
	var pitch_material = new THREE.SpriteMaterial({
		map:pitch, color:0xffffff, fog:true})
	var girl1 = new THREE.Sprite(pitch_material)
	girl1.position.y = .5
	girl1.position.x = 5
	girl1.position.z = 5
	scene.add(girl1)

	var girl2_geometry = new THREE.PlaneGeometry(1, 1)
	var girl2_material = new THREE.MeshBasicMaterial({map:pitch,
		transparent:true})
	var girl2 = new THREE.Mesh(girl2_geometry, girl2_material)
	girl2.position.y = 0.5
	girl2.position.x = 4
	girl2.position.z = 5
	scene.add(girl2)

	var box_img = new THREE.TextureLoader().load("img/box.png")
	box_img.magFilter = THREE.NearestFilter
	var box_geometry = new THREE.PlaneGeometry(1, 1)
	var box_material = new THREE.MeshBasicMaterial({map:box_img,
		color:0xffffff, transparent:true})
	var box = new THREE.Mesh(box_geometry, box_material)
	box.position.y = 0.5 - 1/8
	box.position.x = 3
	box.position.z = 5
	box.rotation.x = Math.PI*0.0
	scene.add(box)


	function update() {
		cube.rotation.x += 0.1
		cube.rotation.y += 0.01
	}
	return update
}

function render(renderer, scene, camera, time) {
	requestAnimationFrame(render.bind(this, renderer, scene, camera))
	update()
	renderer.render(scene, camera)
}
