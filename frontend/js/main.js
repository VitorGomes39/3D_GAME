// ==========================================
// 1. IMPORTAÇÕES DE MÓDULOS
// ==========================================
import * as THREE from 'three';
import { initPlayerControls, updatePlayerMovement } from './player.js';

let scene, camera, renderer, clock;

// ==========================================
// DESIGN DO MAPA (Lobby inicial + Labirinto)
// ==========================================
const MAPA = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1], // Saída do lobby na coluna 6
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TAMANHO_BLOCO = 3; 
const ALTURA_PAREDE = 3.5; 

// Função para gerar textura de chão e teto via código
function criarTexturaProcedural(cor1, cor2, tipo) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (tipo === 'xadrez') {
        ctx.fillStyle = cor1; ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = cor2;
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillRect(128, 128, 128, 128);
    } else {
        ctx.fillStyle = cor1; ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = cor2; ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 248);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    return texture;
}

function init() {
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    scene.fog = new THREE.FogExp2(0x000000, 0.03);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Spawn no centro do Lobby (Linha 3, Coluna 3)
    camera.position.set(3 * TAMANHO_BLOCO, 1.6, 3 * TAMANHO_BLOCO);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const container = document.getElementById('game-container');
    if (container) container.appendChild(renderer.domElement);

    // Iluminação
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.8); 
    scene.add(luzAmbiente);

    const luzLanterna = new THREE.PointLight(0xffffff, 2.5, 30);
    camera.add(luzLanterna); 
    scene.add(camera); 

    // Textura das paredes
    const textureLoader = new THREE.TextureLoader();
    const texturaParede = textureLoader.load('frontend/assets/texturas/parede.png');
    texturaParede.magFilter = THREE.NearestFilter;

    const materialParede = new THREE.MeshStandardMaterial({ map: texturaParede, roughness: 0.8 });
    const geometriaParede = new THREE.BoxGeometry(TAMANHO_BLOCO, ALTURA_PAREDE, TAMANHO_BLOCO);

    // Construção das Paredes (loop corrigido: coluna++)
    for (let linha = 0; linha < MAPA.length; linha++) {
        for (let coluna = 0; coluna < MAPA[linha].length; coluna++) {
            if (MAPA[linha][coluna] === 1) {
                const blocoWall = new THREE.Mesh(geometriaParede, materialParede);
                blocoWall.position.x = coluna * TAMANHO_BLOCO;
                blocoWall.position.y = ALTURA_PAREDE / 2; 
                blocoWall.position.z = linha * TAMANHO_BLOCO;
                scene.add(blocoWall);
            }
        }
    }

    // Chão e Teto
    const larguraMapa = MAPA[0].length * TAMANHO_BLOCO;
    const profundidadeMapa = MAPA.length * TAMANHO_BLOCO;
    const geometriaPlano = new THREE.PlaneGeometry(larguraMapa, profundidadeMapa);

    // Chão Xadrez
    const texturaChao = criarTexturaProcedural('#eeeeee', '#222222', 'xadrez');
    texturaChao.repeat.set(MAPA[0].length, MAPA.length);
    const materialChao = new THREE.MeshStandardMaterial({ map: texturaChao, roughness: 0.5 });
    
    const chao = new THREE.Mesh(geometriaPlano, materialChao);
    chao.rotation.x = -Math.PI / 2;
    chao.position.set(larguraMapa / 2 - TAMANHO_BLOCO/2, 0, profundidadeMapa / 2 - TAMANHO_BLOCO/2);
    scene.add(chao);

    // Teto
    const texturaTeto = criarTexturaProcedural('#444444', '#222222', 'teto');
    texturaTeto.repeat.set(MAPA[0].length, MAPA.length);
    const materialTeto = new THREE.MeshStandardMaterial({ map: texturaTeto, roughness: 0.9 });
    
    const teto = new THREE.Mesh(geometriaPlano, materialTeto);
    teto.rotation.x = Math.PI / 2;
    teto.position.set(larguraMapa / 2 - TAMANHO_BLOCO/2, ALTURA_PAREDE, profundidadeMapa / 2 - TAMANHO_BLOCO/2);
    scene.add(teto);

    // Controles
    initPlayerControls(camera, scene);

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    updatePlayerMovement(deltaTime, camera, MAPA, TAMANHO_BLOCO);
    renderer.render(scene, camera);
}

init();
animate();
