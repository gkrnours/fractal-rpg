Math.TAU = Math.PI*2

var mouse = new THREE.Vector2()
var raycaster = new THREE.Raycaster()

document.addEventListener("DOMContentLoaded", start)
function start() {
	var ratio = window.innerWidth/window.innerHeight
	var scene = new THREE.Scene()
	var camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 1000)
	camera.position.z = 20
	camera.position.x = 15
	camera.position.y = 5
	camera.lookAt({x:15,y:0,z:0})

	var renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth/1, window.innerHeight/1, false)
	document.body.appendChild(renderer.domElement)

	update = setup(scene, camera)
	render(renderer, scene, camera)

	document.addEventListener('mousemove', function(evt) {
		mouse.x = (evt.clientX / window.innerWidth) * 2 - 1
		mouse.y = - (evt.clientY / window.innerHeight) * 2 + 1
	}, false)
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
	skybox.position.z = 20
	skybox.position.x = 15
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
	castle.position.z = -25
	castle.position.y = -5
	scene.add(castle)

	/********
	 * node *
	 ********/

	var oReq = new XMLHttpRequest()
	oReq.addEventListener("load", function() {
		var data = JSON.parse(oReq.responseText)
		var atlas = data.atlas
		var nodes = {}
		for (type in atlas) {
			var texture = new THREE.TextureLoader().load(atlas[type].texture)
			texture.magFilter = THREE.NearestFilter
			nodes[type] = make_node(texture, parseInt(atlas[type].color))
		}

		var map = {}
		var path = {}
		for (i=0; i<data.map.length; ++i) {
			var loc = data.map[i]
			var node = nodes[loc.type].clone()
			node.position.x = loc.position[0]
			node.position.z = loc.position[1]
			scene.add(node)
			map[loc.id] = node
			path[loc.id] = loc.link
		}
		for (p in path) {
			for (i=0; path[p] && i<path[p].length; ++i) {
				scene.add( make_path(map[p], map[path[p][i]]) )
			}
		}
	})
	oReq.open("GET", "map.json")
	oReq.send()

/*
	var pitch = new THREE.TextureLoader().load("img/pitch.png")
	pitch.magFilter = THREE.NearestFilter
	var girl = make_standin(pitch)
	girl.position.x = 5
	girl.position.z = 5
	scene.add(girl)

	var box_img = new THREE.TextureLoader().load("img/box.png")
	box_img.magFilter = THREE.NearestFilter
	var box = make_standin(box_img)
	box.position.y -= 2/16
	sea_node.add(box)
*/

	t0 = performance.now()
	i = 0
	j = 0
	offset = 0
	var focus = []
	function update() {
		if (performance.now() - t0 < 100) {
			return
		}
		t0 = performance.now()
		++j
		raycaster.setFromCamera(mouse, camera)
		var intersects = raycaster.intersectObjects(scene.children)
		var new_focus = []
		for (i=0; i < intersects.length; ++i) {
			obj = intersects[i].object
			if (obj.name == "node" || obj.name == "path") {
				new_focus.push(obj)
			}
		}
		for (i=0; i < focus.length; ++i) {
			if (!(focus[i] in new_focus)) {
				// console.log("do unfocus", focus[i] in new_focus)
				unselect(focus[i])
			}
		}
		for (i=0; i < new_focus.length; ++i) {
			if (!(new_focus[i] in focus)) {
				select(new_focus[i])
			}
		}
		focus = new_focus

		cube.rotation.x += 0.1
		cube.rotation.y += 0.01
		/*
		if (500 < (performance.now() - t0)) {
			i++
			t0 = performance.now()
			offset = (offset+1) % 4
		//	sea.offset.x = offset/4
		}
		*/
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
	var node_matrix = new THREE.Matrix4()
	var main_geometry = new THREE.CircleGeometry(2, 12)
	node_geometry.merge(main_geometry, node_matrix, 0)
	var border_geometry = new THREE.RingGeometry(2, 2.5, 12, 2)
	node_geometry.merge(border_geometry, node_matrix, 1)
	node_geometry.mergeVertices()
	node_geometry.rotateX(Math.TAU * .75)
	var node = new THREE.Mesh(node_geometry, node_material)
	node.name = "node"
	if (pos) {
		node.position.x = pos[0]
		node.position.z = pos[1]
	}
	return node
}

function make_path(start, stop) {
	start_color = "#"+start.material.materials[1].color.getHexString()
	stop_color  = "#"+ stop.material.materials[1].color.getHexString()
	d_x = stop.position.x - start.position.x
	d_z = start.position.z - stop.position.z
	var path_texture = generate_gradient(start_color, stop_color)
	var path_geometry = new THREE.PlaneGeometry(1.2, Math.hypot(d_x,d_z) - 4.4)
	path_geometry.rotateX(Math.TAU * .75)
	path_geometry.rotateY(Math.atan2(d_z, d_x) + (Math.TAU * .25))
	path_geometry.rotation_y = Math.atan2(d_z, d_x) + (Math.TAU * .25)
	var path_material = new THREE.MeshBasicMaterial({map: path_texture})
	var path = new THREE.Mesh(path_geometry, path_material)
	path.position.x = (stop.position.x + start.position.x) * .5
	path.position.z = (stop.position.z + start.position.z) * .5
	path.position.y = -0.01
	path.name = "path"
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

var k = 0
function highlight(item, color) {
	var hili_material = new THREE.MeshBasicMaterial({color: color})
	if (item.name == "path") {
		param = item.geometry.parameters
		var hili_geometry = new THREE.PlaneGeometry(2, param.height)
		hili_geometry.rotateX(Math.TAU * .75)
		hili_geometry.rotateY(item.geometry.rotation_y)
	}
	else if (item.name == "node") {
		var hili_geometry = new THREE.CircleGeometry(2.9, 12)
		hili_geometry.rotateX(Math.TAU * .75)
	}
	/*
		var item_texture = item.material.materials[0].map
		var item_color = item.material.materials[1].color
		console.log(item_texture, item_color)
		var hili_material = new THREE.MeshBasicMaterial({
			color: item_color, map: item_texture})
	*/
	var hilight = new THREE.Mesh(hili_geometry, hili_material)
	hilight.name = "hilight"
	hilight.position.y = -0.02
	item.add(hilight)
}

function unhighlight(obj) {
	obj.remove(obj.getObjectByName("hilight"))
}

function select(obj) {
	//console.log("select", obj)
	highlight(obj, 0x888888)
}
function unselect(obj) {
	//console.log("unselect", obj)
	unhighlight(obj)
}
