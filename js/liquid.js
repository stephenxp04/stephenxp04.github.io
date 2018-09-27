// Three JS
window.addEventListener('load', init, false);
function init() {
  console.log('Init Functions');
  createWorld();
  createLights();
  createBoat();
  // createGrid();
  createOcean();
  animation();
}

var colors = [0xDE5006, 0x42447, 0xC0A468, 0xF38D58, 0x615173];

var Theme = {
  // _dark:0xFFFFFF,
  _black:0x0A0A0A,
  _dark:0x202020,   // Background
//   _cont:0xFFD3D3,   // Lines
  _cont:0xF00000,
  _blue:0x83CFF,
  _red:0xF00000,      //
  _cyan:0x00FFFF,   // Material
  _white:0x00B0EB,  // Lights
  _purple: 0xFF00FF
}
var scene, camera, renderer, container;
var _width, _height;
var _ambientLights, _lights, _rectAreaLight;
var _ocean;
var _boatGroup = new THREE.Object3D();
//--------------------------------------------------------------------
function createWorld() {
  _width = window.innerWidth;
  _height= window.innerHeight;
  //---
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(Theme._dark, 5, 20);
  scene.background = new THREE.Color(Theme._dark);
  //---
  camera = new THREE.PerspectiveCamera(20, _width/_height, 1, 1000);
  camera.position.set(0,2,10);
  var canvas = document.querySelector("canvas");
  //---
  renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:false});
  renderer.setSize(_width, _height);
  renderer.shadowMap.enabled = true;
  //---
  document.body.appendChild(renderer.domElement);
  //---
  window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
  _width = window.innerWidth;
  _height = window.innerHeight;
  renderer.setSize(_width, _height);
  camera.aspect = _width / _height;
  camera.updateProjectionMatrix();
}
//--------------------------------------------------------------------
function createLights() {
  _ambientLights = new THREE.HemisphereLight(Theme._cont, Theme._white, 2);
  _backlight = new THREE.PointLight(Theme._white, 1);
  _backlight.position.set(-5,-20,-20);
  _rectAreaLight = new THREE.RectAreaLight(Theme._white, 20, 3, 3);
  _rectAreaLight.position.set(2,2,-20);
  //---
  _rectAreaLightHelper = new THREE.RectAreaLightHelper(_rectAreaLight);
  //---
  _frontlight = new THREE.PointLight(Theme._white, 0.1);
  _frontlight.position.set(0,2,-2);
  scene.add(_backlight);
  scene.add(_ambientLights);
  scene.add(_rectAreaLight);
  scene.add(_frontlight);
  //scene.add(_rectAreaLightHelper);
}
//--------------------------------------------------------------------
boatElement = function() {
//   var boatGeo = new THREE.CubeGeometry();
//   var boatMat = new THREE.MeshStandardMaterial({color:Theme._blue});
   this.boatA = new THREE.Object3D();
//   this.boat = new THREE.Mesh(boatGeo, boatMat);
  var boatGeo = new THREE.IcosahedronGeometry();
  var boatMat = new THREE.MeshPhongMaterial( { 
      color: Theme._cyan, 
      wireframe: true, 
      wireframeLinewidth: 3 } 
  );

  this.boat = new THREE.Mesh( boatGeo, boatMat );
  this.boat.castShadow = true;
  this.boat.vel = 1+Math.random()*4;
  this.boat.amp = 1+Math.random()*6;
  this.boat.pos = Math.random()*.2;
  this.boatA.add(this.boat);
}
boatElement.prototype.movePosition = function(moveValue = 1) {
  this.boat.position.x = -Math.random() * moveValue + Math.random() * moveValue;
  this.boat.position.z = -Math.random() * moveValue + Math.random() * moveValue;
  this.boat.rotation.y = (Math.random()*360) * Math.PI / 180;
}
boatElement.prototype.sizeElement = function(sizeValue = 1) {
//   this.boat.scale.z = this.boat.scale.x = Math.random() * sizeValue;
//   this.boat.scale.y = 0.5+ Math.random() * (sizeValue);

  this.boat.scale.z = this.boat.scale.y = this.boat.scale.x = Math.random() * sizeValue;
//   this.boat.scale.y = 0.5+ Math.random() * (sizeValue);
}
function createBoat(boatValue = 10) {
  for (var i = 0; i<boatValue; i++){
    var _boatElementItem = new boatElement();
    _boatElementItem.movePosition(5);
    _boatElementItem.sizeElement();
    _boatGroup.add(_boatElementItem.boat);
  };
  scene.add(_boatGroup);
  console.log('Hello Boat');
}
oceanElement = function(wirefr = true, geo_frag = 25) {
  var geo_size = 25;
  var geo = new THREE.PlaneGeometry(geo_size,geo_size,geo_frag,geo_frag);
  geo.mergeVertices();
  this.meshA = new THREE.Object3D();
  var l = geo.vertices.length;
  this.waves = [];
  //---
  for (var i = 0; i<l; i++) {
    var v = geo.vertices[i];
    this.waves.push({
      y:v.y,
      x:v.x,
      z:v.z,
      ang:Math.PI*2,
      amp:Math.random()*(0.2),
      speed:0.03+Math.random()*0.05
    });
  };
  var wmat = new THREE.MeshPhysicalMaterial({color:Theme._white, wireframe:true, transparent:false, opacity:1 });
  var mat = new THREE.MeshPhysicalMaterial({color:Theme._white, transparent:true, opacity:0.85, wireframe:false});
  this.wire = new THREE.Mesh(geo, wmat);
  this.mesh = new THREE.Mesh(geo, mat);
  if (wirefr) this.mesh.add(this.wire);
  this.meshA.add(this.mesh);
  this.mesh.reseivedShadow = true;
  this.mesh.rotation.x = -90 * Math.PI / 180;
}
oceanElement.prototype.moveVertices = function() {
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  //---
  for (var i= 0; i<l; i++) {
    var v = verts[i];
    var vpros = this.waves[i];
    v.x = vpros.x + Math.cos(vpros.ang)*vpros.amp;
    v.y = vpros.y + Math.sin(vpros.ang/2)*vpros.amp;
    v.z = vpros.z + Math.cos(vpros.ang/3)*vpros.amp;
    vpros.ang += vpros.speed;
  };
  this.mesh.geometry.verticesNeedUpdate = true;
  this.mesh.geometry.morphTargetsNeedUpdate = true;
}
function createOcean() {
  _ocean = new oceanElement();
  _ocean.mesh.scale.set(1,1,1);
  scene.add(_ocean.mesh);
}
function createGrid(_gridY = -1) {
  var gridHelper = new THREE.GridHelper(20, 20);
  gridHelper.position.y = _gridY;
  scene.add(gridHelper);
}
//--------------------------------------------------------------------
function animation() {
  var time = Date.now()*0.003;
  //---
  camera.lookAt(scene.position);
  _rectAreaLight.lookAt(scene.position);
  //---
  _ocean.moveVertices();
  for(var i = 0, l = _boatGroup.children.length; i<l; i++) {
    var _boatChildrens = _boatGroup.children[i];
    _boatChildrens.rotation.z = (Math.sin(time / _boatChildrens.vel) * _boatChildrens.amp) * Math.PI / 180;
    _boatChildrens.rotation.x = (Math.cos(time) *_boatChildrens.vel) * Math.PI / 180;
    _boatChildrens.position.y = Math.sin(time / _boatChildrens.vel) * _boatChildrens.pos;
  }
  //_ocean.mesh.rotation.z += 0.002;
  //---
  scene.rotation.y += 0.001;
  requestAnimationFrame(animation);
  renderer.render(scene, camera);
}
