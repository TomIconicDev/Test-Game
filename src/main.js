import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa9d9c8);
scene.fog = new THREE.Fog(0xa9d9c8, 35, 75);

const camera = new THREE.OrthographicCamera(-13,13,13,-13,0.1,100);
camera.position.set(22,25,22);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.querySelector("#game").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.enablePan = true;
controls.enableZoom = true;
controls.minZoom = .8;
controls.maxZoom = 2.2;
controls.target.set(0,0,0);

scene.add(new THREE.HemisphereLight(0xffffff,0x789987,2.4));
const sun = new THREE.DirectionalLight(0xffffff,3.2);
sun.position.set(-12,25,8); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
scene.add(sun);

const mats = {
  floor:new THREE.MeshStandardMaterial({color:0xd9a963,roughness:.88}),
  road:new THREE.MeshStandardMaterial({color:0x686a70,roughness:1}),
  curb:new THREE.MeshStandardMaterial({color:0xece3cc,roughness:.8}),
  green:new THREE.MeshStandardMaterial({color:0x66b85e,roughness:.9}),
  dark:new THREE.MeshStandardMaterial({color:0x51321f,roughness:.75}),
  wood:new THREE.MeshStandardMaterial({color:0x79502c,roughness:.82}),
  cream:new THREE.MeshStandardMaterial({color:0xfff4d7,roughness:.8}),
  red:new THREE.MeshStandardMaterial({color:0xe9655c,roughness:.72}),
  black:new THREE.MeshStandardMaterial({color:0x202522,roughness:.55}),
  glass:new THREE.MeshStandardMaterial({color:0xa9e3dd,transparent:true,opacity:.35,roughness:.1}),
  yellow:new THREE.MeshStandardMaterial({color:0xf2c94c,roughness:.7})
};

function box(name,x,y,z,w,h,d,mat,interactive=false){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.name=name; m.position.set(x,y+h/2,z); m.castShadow=true; m.receiveShadow=true;
  scene.add(m); if(interactive) interactives.push(m); return m;
}
function cyl(name,x,y,z,r,h,mat,interactive=false){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat);
  m.name=name; m.position.set(x,y+h/2,z); m.castShadow=true; m.receiveShadow=true;
  scene.add(m); if(interactive) interactives.push(m); return m;
}

const interactives=[];
const customers=[];
const cars=[];
let cash=83, gems=4, served=0, coffees=0, level=1;
const stations={counter:null, machine:null, till:null};

box("ground",0,-.2,0,30,.4,24,mats.floor);
box("road",-10,.02,0,5,.08,30,mats.road);
box("road2",9,.02,0,3.8,.08,30,mats.road);
box("curb",-7.35,.05,0,.35,.2,30,mats.curb);
box("curb",7.1,.05,0,.35,.2,30,mats.curb);

for(let i=-12;i<=12;i+=4){
  box("lane-mark",-9.9,.09,i,.22,.02,2,mats.cream);
}

function buildShop(){
  box("shop-back",0,0,-7.2,15,4.8,.55,mats.dark);
  box("shop-floor",0,0,-3.7,15,.16,6,mats.cream);
  box("glass-front",0,1.1,-.7,14,3.3,.12,mats.glass);
  box("roof",0,4.8,-4.0,15,.35,7.2,mats.green);
  // green fascia
  box("fascia",0,3.65,-7.0,15,.8,.4,mats.green);
  // coffee logo signs
  for(const x of [-4.5,4.5]){
    const s=cyl("coffee-logo",x,3.1,-7.45,.72,.08,mats.green);
    s.rotation.x=Math.PI/2;
  }
  stations.counter=box("ORDER COUNTER",-3.8,0,-2.0,5.2,1.25,1.15,mats.wood,true);
  stations.machine=box("COFFEE MACHINE",0.2,0,-2.05,2.1,1.55,1.15,mats.dark,true);
  stations.till=box("TILL",3.5,0,-2.0,2.3,1.25,1.15,mats.wood,true);
  box("machine-top",0.2,1.55,-2.05,1.45,.35,.9,mats.black);
  cyl("cup",.2,1.9,-2.05,.28,.55,mats.cream);
  box("display",-3.8,1.35,-2.0,4.5,.25,.9,mats.green);
}
buildShop();

function makeTree(x,z){
  cyl("tree-trunk",x,0,z,.28,1.8,mats.wood);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1.25,16,12),mats.green);
  crown.position.set(x,2.7,z); crown.castShadow=true; scene.add(crown);
}
for(const p of [[-6,-5],[-6,3],[-5,8],[5,8],[6,-5],[5,4]]) makeTree(...p);

function makeCar(z,color=0xe9655c){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(2.8,.65,1.45),new THREE.MeshStandardMaterial({color,roughness:.65}));
  body.position.y=.65; body.castShadow=true; g.add(body);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.55,.65,1.15),mats.cream);
  cabin.position.set(.15,1.15,0); cabin.castShadow=true; g.add(cabin);
  for(const x of [-.95,.95]) for(const zz of [-.68,.68]){
    const w=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.16,16),mats.black);
    w.rotation.z=Math.PI/2; w.position.set(x,.32,zz); g.add(w);
  }
  g.position.set(-10,.02,z); scene.add(g); cars.push({g,z,state:"approach",t:0});
}
makeCar(-8,0xf06d61);
makeCar(0,0xeebf4b);
makeCar(8,0x78a7e8);

function makeCustomer(x,z){
  const g=new THREE.Group();
  const skin=new THREE.MeshStandardMaterial({color:[0xf0b98c,0x8b5a3c,0xd18d68][Math.floor(Math.random()*3)]});
  const shirt=new THREE.MeshStandardMaterial({color:[0x4b9b5c,0x6c79c7,0xd65c52,0xe0aa3e][Math.floor(Math.random()*4)]});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.27,.36,.9,12),shirt);
  body.position.y=.75; body.castShadow=true; g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.29,14,10),skin);
  head.position.y=1.35; head.castShadow=true; g.add(head);
  g.position.set(x,0,z); scene.add(g);
  customers.push({g,state:"walk",t:0});
}
makeCustomer(-2.0,-1.0);
makeCustomer(2.4,.7);

function spawnCustomer(){
  makeCustomer((Math.random()-.5)*5,-.5+Math.random()*2);
  toast("New customer arrived!");
}

function toast(msg){
  const el=document.querySelector("#toast"); el.textContent=msg; el.style.opacity=1;
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.style.opacity=0,1500);
}

function updateUI(){
  document.querySelector("#cash").textContent="$"+cash;
  document.querySelector("#gems").textContent=gems;
  document.querySelector("#level").textContent=level;
  document.querySelector("#servedCount").textContent=served;
  document.querySelector("#coffeeCount").textContent=coffees;
}
updateUI();

const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
renderer.domElement.addEventListener("pointerdown",e=>{
  pointer.x=(e.clientX/innerWidth)*2-1; pointer.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(interactives,true)[0];
  if(!hit) return;
  if(hit.object.name.includes("COFFEE")) {
    coffees++; cash+=2; toast("☕ Coffee made +$2");
  } else if(hit.object.name==="ORDER COUNTER") {
    served++; cash+=8; toast("✅ Customer served +$8");
    if(served%10===0){level++; toast("⭐ Level up!");}
  } else if(hit.object.name==="TILL") {
    cash+=5; toast("💵 Cash collected +$5");
  }
  updateUI();
});

document.querySelector("#tasksBtn").onclick=()=>document.querySelector("#taskPanel").classList.toggle("hidden");
document.querySelector("#closeTasks").onclick=()=>document.querySelector("#taskPanel").classList.add("hidden");
document.querySelector("#upgradeBtn").onclick=()=>{
  const price=30+level*20;
  if(cash>=price){cash-=price; level++; updateUI(); toast("⬆️ Shop upgraded!");}
  else toast("Need $"+price+" to upgrade");
};
document.querySelector("#shopBtn").onclick=()=>toast("Shop: upgrades coming next");
document.querySelector("#mapBtn").onclick=()=>toast("Map: more locations coming next");

let last=performance.now(), spawnTimer=0;
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-last)/1000,.05); last=now;
  spawnTimer+=dt;
  if(spawnTimer>9){spawnTimer=0; spawnCustomer();}
  customers.forEach((c,i)=>{
    if(c.state==="walk"){
      const target=new THREE.Vector3(-1.0,0,-2.7);
      c.g.position.lerp(target,.018);
      if(c.g.position.distanceTo(target)<.15)c.state="wait";
    } else c.g.rotation.y=Math.sin(now*.001+i)*.08;
  });
  cars.forEach(c=>{
    if(c.state==="approach"){
      c.g.position.x += dt*.7;
      if(c.g.position.x>-3.8)c.state="park";
    }
  });
  renderer.render(scene,camera);
}
animate(performance.now());

addEventListener("resize",()=>{
  const a=innerWidth/innerHeight, s=13;
  camera.left=-s*a; camera.right=s*a; camera.top=s; camera.bottom=-s;
  camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight);
});
