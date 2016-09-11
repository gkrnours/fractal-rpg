Math.TAU = Math.PI*2

document.addEventListener("DOMContentLoaded", start)
function start() {
	var ratio = window.innerWidth/window.innerHeight
	var scene = new THREE.Scene()
	var camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 1000)
	camera.position.z = 10
	camera.position.x = 5
	camera.position.y = 2
	camera.lookAt({x:5,y:0,z:0})

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

	var skybox_urls = [
		"img/sky/side.png", "img/sky/side.png",
		"img/sky/bottom.png", "img/sky/top.png",
		"img/sky/side.png", "img/sky/side.png",
	]
	var skybox_texture = new THREE.CubeTextureLoader().load(skybox_urls)
	skybox_texture.magFilter = THREE.NearestFilter
	var skybox_geometry = new THREE.CubeGeometry(100, 100, 100)
	var skybox_material = new THREE.MeshBasicMaterial({
		color: 0xffffff, envMap: skybox_texture, side: THREE.BackSide
	})
	var skybox = new THREE.Mesh(skybox_geometry, skybox_material)
	skybox.position.z = 10
	skybox.position.x = 5
	skybox.position.y = 2
	scene.add(skybox)

	var grass = new THREE.TextureLoader().load("img/grass.png")
	grass.magFilter = THREE.NearestFilter
	var grass_node = make_node(grass, 0x007700, [4, 4.5])
	scene.add(grass_node)

	var castle_texture = new THREE.TextureLoader().load("img/castle.png")
	castle_texture.magFilter = THREE.NearestFilter
	var castle_geometry = new THREE.PlaneGeometry(40, 40)
	var castle_material = new THREE.MeshBasicMaterial({
		map: castle_texture, side: THREE.DoubleSide, transparent: true,
		color: 0x101010
	})
	var castle = new THREE.Mesh(castle_geometry, castle_material)
	castle.position.z = -30
	castle.position.y = -5
	scene.add(castle)

	var pitch = new THREE.TextureLoader().load("img/pitch.png")
	pitch.magFilter = THREE.NearestFilter
	var girl2_geometry = new THREE.PlaneGeometry(1, 1)
	var girl2_material = new THREE.MeshBasicMaterial({
		map:pitch, transparent:true})
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

function make_node(texture, border, pos) {
	texture.wrapS = THREE.RepeatWrapping
	texture.wrapT = THREE.RepeatWrapping
	texture.repeat.set(2, 2)
	var node_geometry = new THREE.Geometry()
	var node_material = new THREE.MeshFaceMaterial([
		new THREE.MeshBasicMaterial({map: texture}),
		new THREE.MeshBasicMaterial({color: border})
	])
	var node_matrix = THREE.Matrix4()
	var main_geometry = new THREE.CircleGeometry(2, 12)
	node_geometry.merge(main_geometry, node_matrix, 0)
	var border_geometry = new THREE.RingGeometry(2, 2.5, 12, 2)
	node_geometry.merge(border_geometry, node_matrix, 1)
	var node = new THREE.Mesh(node_geometry, node_material)
	node.position.x = pos[0]
	node.position.z = pos[1]
	node.rotation.x = Math.TAU * .75
	return node
}
