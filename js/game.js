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
	var grass_node = make_node(grass, 0x007700, [0, 0])
	scene.add(grass_node)

	var pitch = new THREE.TextureLoader().load("img/pitch.png")
	pitch.magFilter = THREE.NearestFilter
	var girl = make_standin(pitch)
	girl.position.x = 5
	girl.position.z = 5
	scene.add(girl)

	var sea = new THREE.TextureLoader().load("img/sea.png")
	sea.magFilter = THREE.NearestFilter
	var sea_node = make_node(sea, 0x000077, [10, 0])
	scene.add(sea_node)

	var box_img = new THREE.TextureLoader().load("img/box.png")
	box_img.magFilter = THREE.NearestFilter
	var box = make_standin(box_img)
	box.position.y -= 2/16
	sea_node.add(box)

	var path = make_path(grass_node, sea_node)
	scene.add(path)

	t0 = performance.now()
	i = 0
	offset = 0
	function update() {
		cube.rotation.x += 0.1
		cube.rotation.y += 0.01
		if (500 < (performance.now() - t0)) {
			i++
			if (i % 5 == 0) {
				select_path(path)
			}
			if (i % 5 == 3) {
				unselect_path(path)
			}
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
	node_geometry.mergeVertices()
	node_geometry.rotateX(Math.TAU * .75)
	var node = new THREE.Mesh(node_geometry, node_material)
	node.position.x = pos[0]
	node.position.z = pos[1]
	return node
}

function make_path(start, stop) {
	start_color = "#"+start.material.materials[1].color.getHexString()
	stop_color  = "#"+ stop.material.materials[1].color.getHexString()
	d_x = stop.position.x - start.position.x
	d_z = start.position.z - stop.position.z
	var path_texture = generate_gradient(start_color, stop_color)
	var path_geometry = new THREE.PlaneGeometry(1.2, Math.hypot(d_x, d_z))
	path_geometry.rotateX(Math.TAU * .75)
	path_geometry.rotateY(Math.atan2(d_z, d_x) + (Math.TAU * .25))
	var path_material = new THREE.MeshBasicMaterial({map: path_texture})
	var path = new THREE.Mesh(path_geometry, path_material)
	path.position.x = (stop.position.x + start.position.x) * .5
	path.position.z = (stop.position.z + start.position.z) * .5
	path.position.y = -0.01

	var select_geometry = new THREE.PlaneGeometry(2, Math.hypot(d_x, d_z) + 1)
	select_geometry.rotateX(Math.TAU * .75)
	select_geometry.rotateY(Math.atan2(d_z, d_x) + (Math.TAU * .25))
	var select_material = new THREE.MeshBasicMaterial({
		color: 0x888888, map: path_texture})
	var select = new THREE.Mesh(select_geometry, select_material)
	select.name = "select"
	select.position.y = -0.01
	select.visible = false
	path.add(select)
	return path
}

function make_standin(texture) {
	var standin_geometry = new THREE.PlaneGeometry(1, 1)
	var standin_material = new THREE.MeshBasicMaterial({
		map:texture, transparent:true})
	var standin = new THREE.Mesh(standin_geometry, standin_material)
	standin.position.y = 0.5
	return standin
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
	gradient.addColorStop(0.2, start)
	gradient.addColorStop(0.8, stop)
	context.fillStyle = gradient
	context.fill()

	var texture = new THREE.Texture(canvas)
	texture.needsUpdate = true
	return texture
}

function select_path(path) {
	path.getObjectByName("select").visible = true
}
function unselect_path(path) {
	path.getObjectByName("select").visible = false
}
