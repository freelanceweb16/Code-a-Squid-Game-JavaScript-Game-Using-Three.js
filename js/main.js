/* Global Variables */
const start_position = 3;
const end_position = -start_position;
const text = document.querySelector('.text');
const TIME_LIMIT = 10;
let gameStat = "loading";
let isLookingBackWard = true;

/* Audio Background */
const audio = document.getElementById("audioBg");
audio.volume = 0.2;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.setClearColor(0xb7c3f3, 1);


/* Ambiant Light */
const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );


camera.position.z = 5;
// renderer.render( scene, camera );




/* GLTF Loader */
const loader = new THREE.GLTFLoader();

/* Doll */
class Doll {
    constructor() {
        loader.load(
            'https://freelanceweb16.github.io/Code-a-Squid-Game-JavaScript-Game-Using-Three.js/models/scene.gltf', (params) => {
                scene.add(params.scene);
                params.scene.scale.set(0.4, 0.4, 0.4);
                params.scene.position.set(0, -1, 0);
                this.doll = params.scene;
        });
    }

    lookBackward(){
        // this.doll.rotation.y = -3.15;
        gsap.to(this.doll.rotation, {y:-3.15, duration:.45});
        setTimeout(() => isLookingBackWard = true, 150);
    }

    lookForward(){
        // this.doll.rotation.y = 0;
        gsap.to(this.doll.rotation, {y:0, duration:.45});
        setTimeout(() => isLookingBackWard = false, 450);
    }

    async start(){
        this.lookBackward();
        await delay((Math.random() * 1000) + 1000);
        this.lookForward();
        await delay((Math.random() * 750) + 750);
        this.start();
    }
}

class Player{
    constructor(){
        const geometry = new THREE.SphereGeometry( .4, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 1;
        sphere.position.x = start_position;
        scene.add( sphere );
        this.player = sphere;
        this.playerInfo = {
            positionX: start_position,
            velocity: 0
        }
    }

    run(){
        this.playerInfo.velocity = .3;
    }

    stop(){
        // this.playerInfo.velocity = 0;
        gsap.to(this.playerInfo, {velocity:0, duration:.1});
    }

    check(){
        if(this.playerInfo.velocity > 0 && !isLookingBackWard){
            // console.log('You Lose !!!');
            text.innerText = "You Lose !";
            youLoose();
            gameStat = "over";
        }
        if(this.playerInfo.positionX < end_position + .4){
            // console.log('You Win !!!');
            text.innerText = "You Win !";
            gameStat = "over";
        }
    }

    update(){
        this.check();
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.player.position.x = this.playerInfo.positionX;
    }
}

function youLoose(){
    if(gameStat == "over") return
    const source = document.getElementById('audioSource');
    source.src = 'https://freelanceweb16.github.io/Code-a-Squid-Game-JavaScript-Game-Using-Three.js/misc/Youloose.mp3';
  
    audio.load(); //call this to just preload the audio without playing
    audio.play(); //call this to play the song right away

    setTimeout(() => {audio.pause();}, 1500);
}

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}


function createCube(size, positionX, rotY = 0, color = 0xfbc851){
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d );
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotY;
    scene.add( cube );
    return cube;
}

function createTrack(){
    createCube({w:start_position * 2 + .2,h:1.5,d:1}, 0, 0, 0xe5a716).position.z = -1;
    createCube({w:.2,h:1.5,d:1}, start_position, -.35);
    createCube({w:.2,h:1.5,d:1}, end_position, .35);
}


function onWindowResize(camera, renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate() {
    if(gameStat == "over") return
    renderer.render( scene, camera );
	requestAnimationFrame( animate );
    // console.log('animate');
    // cube.rotation.z += 0.05;
    player.update();
}

function startGame(){
    gameStat = "running";
    let progressBar = createCube({w:5, h:.1,d: 1},0);
    progressBar.position.y = 3.35;
    gsap.to(progressBar.scale, {x:0, duration: TIME_LIMIT, ease:"none"});
    setTimeout(() =>{
        if(gameStat != "over"){
            text.innerText = "You ran out of time !";
            youLoose();
            gameStat = 'over';
        }
    }, TIME_LIMIT * 1000);
    doll.start();
}

const doll = new Doll();
const player = new Player();

async function init(){
    await delay(500);
    text.innerText = "Starting in 3";
    await delay(500);
    text.innerText = "Starting in 2";
    await delay(500);
    text.innerText = "Starting in 1";
    await delay(500);
    text.innerText = "Go!";
    startGame();
}

window.addEventListener('resize', function(){onWindowResize(camera, renderer)}, false);
window.addEventListener('keydown', (e) => {
    // alert(e.key);
    if(gameStat != "running") return
    if(e.key === "ArrowUp"){
        player.run();
    }
});

window.addEventListener('keyup', (e) => {
    // alert(e.key);
    if(e.key === "ArrowUp"){
        player.stop();
    }
})




init();
animate();
createTrack();

