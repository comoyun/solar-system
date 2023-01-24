import data from "./data.js";

var APP = {

	Player: function () {

		const mercuryBtn = document.getElementById("mercury"),
			venusBtn = document.getElementById("venus"),
			earthBtn = document.getElementById("earth"),
			marsBtn = document.getElementById("mars"),
			jupiterBtn = document.getElementById("jupiter"),
			saturnBtn = document.getElementById("saturn"),
			neptuneBtn = document.getElementById("neptune"),
			infoEl = document.getElementById("info"),
			allBtn = document.getElementById("all");

		var renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio); // TODO: Use player.setPixelRatio()
		renderer.outputEncoding = THREE.sRGBEncoding;

		var loader = new THREE.ObjectLoader();
		var camera, scene;

		var vrButton = VRButton.createButton(renderer); // eslint-disable-line no-undef

		var events = {};

		var spheres = [];

		var dom = document.createElement('div');
		dom.appendChild(renderer.domElement);

		this.dom = dom;

		var inc = 0,
			oldCamX = 0,
			oldCamY = 0,
			oldCamZ = 0,
			currentPlanet;

		this.width = 500;
		this.height = 500;

		const planetInfo = function (_planetName) {
			infoEl.innerHTML = "";
			const tpr = new Typewriter("#info", {
				autoStart: true,
				delay: 50,
				deleteSpeed: 5,
			});
			
			tpr.typeString(data[_planetName || ""]).waitFor(100000);
			
			currentPlanet = _planetName;
		};

		allBtn.addEventListener("click", () => planetInfo("all"));
		mercuryBtn.addEventListener("click", () => planetInfo("mercury"));
		venusBtn.addEventListener("click", () => planetInfo("venus"));
		earthBtn.addEventListener("click", () => planetInfo("earth"));
		marsBtn.addEventListener("click", () => planetInfo("mars"));
		jupiterBtn.addEventListener("click", () =>
			planetInfo("jupiter")
		);
		saturnBtn.addEventListener("click", () => planetInfo("saturn"));
		neptuneBtn.addEventListener("click", () =>
			planetInfo("neptune")
		);

		this.load = function (json) {

			var project = json.project;

			if (project.vr !== undefined) renderer.xr.enabled = project.vr;
			if (project.shadows !== undefined) renderer.shadowMap.enabled = project.shadows;
			if (project.shadowType !== undefined) renderer.shadowMap.type = project.shadowType;
			if (project.toneMapping !== undefined) renderer.toneMapping = project.toneMapping;
			if (project.toneMappingExposure !== undefined) renderer.toneMappingExposure = project.toneMappingExposure;
			if (project.physicallyCorrectLights !== undefined) renderer.physicallyCorrectLights = project.physicallyCorrectLights;

			this.setScene(loader.parse(json.scene));
			this.setCamera(loader.parse(json.camera));

			events = {
				init: [],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				pointerdown: [],
				pointerup: [],
				pointermove: [],
				update: []
			};

			var scriptWrapParams = 'player,renderer,scene,camera';
			var scriptWrapResultObj = {};

			for (var eventKey in events) {

				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[eventKey] = eventKey;

			}

			var scriptWrapResult = JSON.stringify(scriptWrapResultObj).replace(/\"/g, '');

			for (var uuid in json.scripts) {

				var object = scene.getObjectByProperty('uuid', uuid, true);

				if (object === undefined) {

					console.warn('APP.Player: Script without object.', uuid);
					continue;

				}

				spheres.push(object);

				var scripts = json.scripts[uuid];

				for (var i = 0; i < scripts.length; i++) {

					var script = scripts[i];

					var functions = (new Function(scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';').bind(object))(this, renderer, scene, camera);

					for (var name in functions) {

						if (functions[name] === undefined) continue;

						if (events[name] === undefined) {

							console.warn('APP.Player: Event type not supported (', name, ')');
							continue;

						}

						events[name].push(functions[name].bind(object));

					}

				}

			}

			dispatch(events.init, arguments);

		};

		this.setCamera = function (value) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			oldCamX = camera.position.x;
			oldCamY = camera.position.y;
			oldCamZ = camera.position.z;
		};

		this.setScene = function (value) {

			scene = value;

		};

		this.setPixelRatio = function (pixelRatio) {

			renderer.setPixelRatio(pixelRatio);

		};

		this.setSize = function (width, height) {

			this.width = width;
			this.height = height;

			if (camera) {

				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();

			}

			renderer.setSize(width, height);

		};

		function dispatch(array, event) {

			for (var i = 0, l = array.length; i < l; i++) {

				array[i](event);

			}

		}

		var time, startTime, prevTime;

		function animate() {

			time = performance.now();

			try {

				dispatch(events.update, { time: time - startTime, delta: time - prevTime });

			} catch (e) {

				console.error((e.message || e), (e.stack || ''));

			}

			inc += 0.001;

			if (currentPlanet === "mercury") {
				camera.position.x = spheres[0].position.x - 0.55;
				camera.position.y = spheres[0].position.y + 0.55;
				camera.position.z = spheres[0].position.z + 0.55;

				camera.lookAt(...spheres[0].position);

			} else if (currentPlanet === "venus") {
				camera.position.x = spheres[1].position.x - 0.9;
				camera.position.y = spheres[1].position.y + 0.9;
				camera.position.z = spheres[1].position.z - 0.6;

				camera.lookAt(...spheres[1].position);

			} else if (currentPlanet === "earth") {
				camera.position.x = spheres[3].position.x - 0.78;
				camera.position.y = spheres[3].position.y + 0.78;
				camera.position.z = spheres[3].position.z - 0.45;

				camera.lookAt(...spheres[3].position);

			}else if (currentPlanet === "mars") {
				camera.position.x = spheres[2].position.x - 0.7;
				camera.position.y = spheres[2].position.y + 0.7;
				camera.position.z = spheres[2].position.z - 0.4;

				camera.lookAt(...spheres[2].position);

			} else if (currentPlanet === "jupiter") {
				camera.position.x = spheres[5].position.x - 1.4;
				camera.position.y = spheres[5].position.y + 1.4;
				camera.position.z = spheres[5].position.z - 1.4;

				camera.lookAt(...spheres[5].position);

			} else if (currentPlanet === "saturn") {
				camera.position.x = spheres[6].position.x - 1.4;
				camera.position.y = spheres[6].position.y + 1.4;
				camera.position.z = spheres[6].position.z - 1.4;

				camera.lookAt(...spheres[6].position);

			} else if (currentPlanet === "neptune") {
				camera.position.x = spheres[8].position.x - 0.78;
				camera.position.y = spheres[8].position.y + 0.78;
				camera.position.z = spheres[8].position.z - 1;

				camera.lookAt(...spheres[8].position);

			} else {
				camera.position.x = Math.sin(inc) * oldCamX;
				camera.position.z = Math.cos(inc) * oldCamX;

				camera.lookAt(...spheres[9].position);
			}

			renderer.render(scene, camera);

			prevTime = time;

		}

		this.play = function () {

			if (renderer.xr.enabled) dom.append(vrButton);

			startTime = prevTime = performance.now();

			document.addEventListener('keydown', onKeyDown);
			document.addEventListener('keyup', onKeyUp);
			document.addEventListener('pointerdown', onPointerDown);
			document.addEventListener('pointerup', onPointerUp);
			document.addEventListener('pointermove', onPointerMove);

			dispatch(events.start, arguments);

			renderer.setAnimationLoop(animate);

		};

		this.stop = function () {

			if (renderer.xr.enabled) vrButton.remove();

			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('pointerup', onPointerUp);
			document.removeEventListener('pointermove', onPointerMove);

			dispatch(events.stop, arguments);

			renderer.setAnimationLoop(null);

		};

		this.render = function (time) {

			dispatch(events.update, { time: time * 1000, delta: 0 /* TODO */ });

			renderer.render(scene, camera);

		};

		this.dispose = function () {

			renderer.dispose();

			camera = undefined;
			scene = undefined;

		};

		//

		function onKeyDown(event) {

			dispatch(events.keydown, event);

		}

		function onKeyUp(event) {

			dispatch(events.keyup, event);

		}

		function onPointerDown(event) {

			dispatch(events.pointerdown, event);

		}

		function onPointerUp(event) {

			dispatch(events.pointerup, event);

		}

		function onPointerMove(event) {

			dispatch(events.pointermove, event);

		}

	}

};

export { APP };
