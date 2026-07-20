// ==========================================
// 1. IMPORTAÇÕES DE MÓDULOS
// ==========================================
import * as THREE from 'three';
import { initPlayerControls, updatePlayerMovement } from './player.js';

let scene, camera, renderer, clock;

// ==========================================
// DESIGN DO MAPA (Estilo Spooky's Mansion)
// Do bloco [1][1] até o [5][5] criamos um quadrado aberto (O LOBBY DE ENTRADA)
// A única saída do Lobby é um corredor estreito que começa na Linha 3, Coluna 6
// ==========================================
const MAPA = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1], // Porta de saída do lobby na col 6
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TAMANHO_BLOCO = 3; 
const ALTURA_PAREDE = 3.5; 

// Função auxiliar para criar texturas retrô (Xadrez/Grelha) sem precisar de arquivos externos
function criarTexturaProcedural(cor1, cor2, tipo) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (tipo === 'xadrez') {
        // Chão quadriculado clássico
        ctx.fillStyle = cor1; ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = cor2;
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillRect(128, 128, 128, 128);
    } else {
        // Teto com placas estilo escritório/mansion
        ctx.fillStyle = cor1; ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = cor2; ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 248);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter; // Pixelado PS1
    return texture;
}

function init() {
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Adiciona uma névoa suave distante para o teto/chão não sumirem do nada
    scene.fog = new THREE.FogExp2(0x000000, 0.04);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // SPAWN: Jogador nasce exatamente no CENTRO do seu novo Lobby (Linha 3, Coluna 3)
    camera.position.set(3 * TAMANHO_BLOCO, 1.6, 3 * TAMANHO_BLOCO);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const container = document.getElementById('game-container');
    if (container) container.appendChild(renderer.domElement);

    // Iluminação forte de teste para avaliar o cenário montado
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.7); 
    scene.add(luzAmbiente);

    const luzLanterna = new THREE.PointLight(0xffffff, 2.5, 30);
    camera.add(luzLanterna); 
    scene.add(camera); 

    // Carregar a sua textura linda de parede
    const textureLoader = new THREE.TextureLoader();
    const texturaParede = textureLoader.load('frontend/assets/texturas/parede.png');
    texturaParede.magFilter = THREE.NearestFilter;

    const materialParede = new THREE.MeshStandardMaterial({ map: texturaParede, roughness: 0.8 });
    const geometriaParede = new THREE.BoxGeometry(TAMANHO_BLOCO, ALTURA_PAREDE, TAMANHO_BLOCO);

    // Construção das Paredes baseadas na Matriz
    for (let linha = 0; linha < MAPA.length; linha++) {
        for (let coluna = 0; coluna < MAPA[linha].length; column++) {
            if (MAPA[linha][coluna] === 1) {
                const blocoWall = new THREE.Mesh(geometriaParede, materialParede);
                blocoWall.position.x = coluna * TAMANHO_BLOCO;
                blocoWall.position.y = ALTURA_PAREDE / 2; 
                blocoWall.position.z = linha * TAMANHO_BLOCO;
                scene.add(blocoWall);
            }
        }
    }

    // ==========================================
    // CRIAÇÃO DO CHÃO E DO TETO RETRÔ
    // ==========================================
    // Tamanho calculado dinamicamente baseado no tamanho total da matriz do mapa
    const larguraMapa = MAPA[0].length * TAMANHO_BLOCO;
    const profundidadeMapa = MAPA.length * TAMANHO_BLOCO;
    const geometriaPlano = new THREE.PlaneGeometry(larguraMapa, profundidadeMapa);

    // 1. O CHÃO (Xadrez estilo Spooky's / Retro)
    const texturaChao = criarTexturaProcedural('#eeeeee', '#222222', 'xadrez');
    texturaChao.repeat.set(MAPA[0].length, MAPA.length); // Ajusta os quadrados ao tamanho do mapa
    const materialChao = new THREE.MeshStandardMaterial({ map: texturaChao, roughness: 0.5 });
    
    const chao = new THREE.Mesh(geometriaPlano, materialChao);
    chao.rotation.x = -Math.PI / 2; // Deita o plano para virar chão
    // Centraliza o plano no meio do labirinto
    chao.position.set(larguraMapa / 2 - TAMANHO_BLOCO/2, 0, profundidadeMapa / 2 - TAMANHO_BLOCO/2);
    scene.add(chao);

    // 2. O TETO (Placas de gesso cinza)
    const texturaTeto = criarTexturaProcedural('#444444', '#222222', 'teto');
    texturaTeto.repeat.set(MAPA[0].length, MAPA.length);
    const materialTeto = new THREE.MeshStandardMaterial({ map: texturaTeto, roughness: 0.9 });
    
    const teto = new THREE.Mesh(geometriaPlano, materialTeto);
    teto.rotation.x = Math.PI / 2; // Vira de ponta cabeça para olhar para baixo
    // Posiciona exatamente no topo das paredes (ALTURA_PAREDE)
    teto.position.set(larguraMapa / 2 - TAMANHO_BLOCO/2, ALTURA_PAREDE, profundidadeMapa / 2 - TAMANHO_BLOCO/2);
    scene.add(teto);

    // Controles do Jogador
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
