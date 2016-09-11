Math.TAU = Math.PI*2

document.addEventListener("DOMContentLoaded", start)
function start() {
	var ratio = window.innerWidth/window.innerHeight
	var scene = new THREE.Scene()
	var camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 1000)
	camera.position.z = 15
	camera.position.x = 10
	camera.position.y = 5
	camera.lookAt({x:10,y:0,z:0})

	var renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth/1, window.innerHeight/1, false)
	document.body.appendChild(renderer.domElement)

	update = setup(scene, camera)
	render(renderer, scene, camera)
}

function setup(scene, camera) {
	var geometry = new THREE.BoxGeometry(1, 1, 1)
	var material = new THREE.MeshBasicMaterial({color: 0x00ff00})
	var cube = new THREE.Mesh(geometry, material)
	cube.position.x = -3
	scene.add(cube)

	/*********
	 * decor *
	 *********/

	var skybox_urls = [
		"img/sky/side.png", "img/sky/side.png",
		"img/sky/bottom.png", "img/sky/top.png",
		"img/sky/side.png", "img/sky/side.png",
	]
	var skybox_texture = new THREE.CubeTextureLoader().load(skybox_urls)
	skybox_texture.magFilter = THREE.NearestFilter
	var skybox_geometry = new THREE.CubeGeometry(100, 100, 100)
	var skybox_material = new THREE.MeshBasicMaterial({
		 envMap: skybox_texture, side: THREE.BackSide
	})
	var skybox = new THREE.Mesh(skybox_geometry, skybox_material)
	skybox.position.z = 15
	skybox.position.x = 10
	skybox.position.y = 5
	scene.add(skybox)

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

	/********
	 * node *
	 ********/

	var grass = new THREE.TextureLoader().load("img/grass.png")
	grass.magFilter = THREE.NearestFilter
	var grass_node = make_node(grass, 0x007700, [5, 5])
	scene.add(grass_node)

	var pitch = new THREE.TextureLoader().load("img/pitch.png")
	pitch.magFilter = THREE.NearestFilter
	var girl2_geometry = new THREE.PlaneGeometry(1, 1)
	var girl2_material = new THREE.MeshBasicMaterial({
		map:pitch, transparent:true})
	var girl2 = new THREE.Mesh(girl2_geometry, girl2_material)
	girl2.position.y = 0.5
	girl2.position.x = 5
	girl2.position.z = 5
	scene.add(girl2)

	var box_img = new THREE.TextureLoader().load("img/box.png")
	box_img.magFilter = THREE.NearestFilter
	var box_geometry = new THREE.PlaneGeometry(1, 1)
	var box_material = new THREE.MeshBasicMaterial({map:box_img,
		color:0xffffff, transparent:true})
	var box = new THREE.Mesh(box_geometry, box_material)
	box.position.y = 0.5 - 1/8
	box.position.x = 4
	box.position.z = 5
	box.rotation.x = Math.TAU*0.0
	scene.add(box)

	var sea = new THREE.TextureLoader().load("img/sea.png")
	sea.magFilter = THREE.NearestFilter
	var sea_node = make_node(sea, 0x000077, [15, 0])
	scene.add(sea_node)

	var path_texture = new THREE.Texture(generate_gradient(
		"#007700", "#000077"
	))
	path_texture.needsUpdate = true
	var path_geometry = new THREE.PlaneGeometry(1, 10)
	var path_material = new THREE.MeshBasicMaterial({
		color: 0xffffff, map: path_texture
	})
	var path = new THREE.Mesh(path_geometry, path_material)
	path.position.x = 10
	path.position.z = 2.5
	path.position.y = -0.01
	path.rotation.x = Math.TAU * .75
	path.rotation.z = Math.TAU * .32
	scene.add(path)

	var line_geometry = new THREE.Geometry()
	geometry.vertices.push({x:0, y:0, z:0}, {x:10, y:0, z:10})
	var line = new THREE.Line(line_geometry)
	console.log("line", line.position, line.rotation)

	t0 = performance.now()
	offset = 0
	function update() {
		cube.rotation.x += 0.1
		cube.rotation.y += 0.01
		if (500 < (performance.now() - t0)) {
			t0 = performance.now()
			offset = (offset+1) % 4
			sea.offset.x = offset/4
		}
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

function generate_gradient(start, stop, smooth) {
	smooth = smooth || 4
	if (smooth < 2 || 10 < smooth) {
		console.warn("smooth value should be between 2 and 10")
	}
	var size = 1 << smooth
	var canvas = document.createElement('canvas')
	canvas.width = size
	canvas.height = size
	var context = canvas.getContext("2d")
	context.rect(0, 0, size, size)
	var gradient = context.createLinearGradient(0, 0, 0, size)
	gradient.addColorStop(0, start)
	gradient.addColorStop(1, stop)
	context.fillStyle = gradient
	context.fill()

	return canvas
}
