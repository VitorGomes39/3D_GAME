// ==========================================
// 1. IMPORTAÇÕES DE MÓDULOS
// ==========================================
import * as THREE from 'three';
import { initPlayerControls, updatePlayerMovement } from './player.js';

// Variáveis globais do motor do jogo
let scene, camera, renderer, clock;

// CONFIGURAÇÕES DO LABIRINTO (1 = Parede, 0 = Caminho livre)
const MAPA = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TAMANHO_BLOCO = 3; 
const ALTURA_PAREDE = 3.5; 

function init() {
    // ==========================================
    // 2. CONFIGURAÇÃO DA CENA E DO RELÓGIO
    // ==========================================
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Névoa desativada temporariamente para o teste de iluminação clara
    // scene.fog = new THREE.FogExp2(0x000000, 0.15);

    // ==========================================
    // 3. CONFIGURAÇÃO DA CÂMERA (Spawn do Jogador)
    // ==========================================
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(1 * TAMANHO_BLOCO, 1.6, 1 * TAMANHO_BLOCO);

    // ==========================================
    // 4. CONFIGURAÇÃO DO RENDERIZADOR
    // ==========================================
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const container = document.getElementById('game-container');
    if (container) {
        container.appendChild(renderer.domElement);
    }

    // ==========================================
    // 5. ILUMINAÇÃO DE TESTE (BEM MAIS FORTE)
    // ==========================================
    // Luz ambiente geral bem clara para testar o cenário
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(luzAmbiente);

    // Lanterna do jogador super forte e com maior alcance
    const luzLanterna = new THREE.PointLight(0xffffff, 3.0, 25);
    luzLanterna.position.set(0, 0, 0); 
    camera.add(luzLanterna); 
    scene.add(camera); 

    // ==========================================
    // 6. CARREGAMENTO DA TEXTURA E LABIRINTO
    // ==========================================
    const textureLoader = new THREE.TextureLoader();
    
    // CAMINHO CORRIGIDO: incluindo a pasta 'frontend/' antes de tudo
    const texturaParede = textureLoader.load('frontend/assets/texturas/parede_base.png');
    
    // Configurações de pixel art estilo PS1
    texturaParede.magFilter = THREE.NearestFilter;
    texturaParede.minFilter = THREE.LinearMipmapLinearFilter;

    const materialParede = new THREE.MeshStandardMaterial({ 
        map: texturaParede,
        roughness: 0.8
    });

    const geometriaParede = new THREE.BoxGeometry(TAMANHO_BLOCO, ALTURA_PAREDE, TAMANHO_BLOCO);

    // Construção das paredes
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

    // Chão visível cinza para o teste
    const geometriaChao = new THREE.PlaneGeometry(100, 100);
    const materialChao = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
    const chao = new THREE.Mesh(geometriaChao, materialChao);
    chao.rotation.x = -Math.PI / 2;
    scene.add(chao);

    // ==========================================
    // 7. INICIALIZAÇÃO DOS CONTROLES
    // ==========================================
    initPlayerControls(camera, scene);

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==========================================
// 9. GAME LOOP
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    // AGORA PASSAMOS O MAPA E O TAMANHO DO BLOCO PARA A FUNÇÃO CALCULAR A COLISÃO
    updatePlayerMovement(deltaTime, camera, MAPA, TAMANHO_BLOCO);

    renderer.render(scene, camera);
}

init();
animate();
