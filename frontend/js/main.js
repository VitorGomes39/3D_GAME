// ==========================================
// 1. IMPORTAÇÕES DE MÓDULOS
// ==========================================
import * as THREE from 'three';
import { initPlayerControls, updatePlayerMovement } from './player.js';

// Variáveis globais do motor do jogo
let scene, camera, renderer, clock;

// CONFIGURAÇÕES DO LABIRINTO
// Matriz do mapa: 1 = Parede com textura, 0 = Caminho livre
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

const TAMANHO_BLOCO = 3; // Largura e profundidade de cada bloco de parede
const ALTURA_PAREDE = 3.5; // Altura das paredes do labirinto

function init() {
    // ==========================================
    // 2. CONFIGURAÇÃO DA CENA E DO RELÓGIO
    // ==========================================
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Névoa para dar um clima de suspense e esconder o infinito
    scene.fog = new THREE.FogExp2(0x000000, 0.15);

    // ==========================================
    // 3. CONFIGURAÇÃO DA CÂMERA (Spawn do Jogador)
    // ==========================================
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Posiciona o jogador no bloco MAPA[1][1] para ele não nascer dentro da parede
    camera.position.set(1 * TAMANHO_BLOCO, 1.6, 1 * TAMANHO_BLOCO);

    // ==========================================
    // 4. CONFIGURAÇÃO DO RENDERIZADOR (Motor Gráfico)
    // ==========================================
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const container = document.getElementById('game-container');
    if (container) {
        container.appendChild(renderer.domElement);
    }

    // ==========================================
    // 5. ILUMINAÇÃO BÁSICA (Estilo Terror)
    // ==========================================
    // Luz ambiente quase nula (tudo escuro por padrão)
    const luzAmbiente = new THREE.AmbientLight(0x111111);
    scene.add(luzAmbiente);

    // Lanterna na mão do jogador (vai iluminar as texturas em tempo real!)
    const luzLanterna = new THREE.PointLight(0xffffff, 1.5, 12);
    luzLanterna.position.set(0, 0, 0); // Fica junto com a câmera
    camera.add(luzLanterna); // Prende a lanterna na câmera
    scene.add(camera); // Adiciona a câmera (com a lanterna presa) na cena

    // ==========================================
    // 6. CARREGAMENTO DA TEXTURA E CRIAÇÃO DO LABIRINTO
    // ==========================================
    const textureLoader = new THREE.TextureLoader();
    
    // Carrega o arquivo que você salvou na pasta assets/texturas
    const texturaParede = textureLoader.load('assets/texturas/parede.png');
    
    // Filtros mágicos para deixar a textura quadriculada/pixelada estilo PS1 retro
    texturaParede.magFilter = THREE.NearestFilter;
    texturaParede.minFilter = THREE.LinearMipmapLinearFilter;
    texturaParede.wrapS = THREE.RepeatWrapping;
    texturaParede.wrapT = THREE.RepeatWrapping;

    // Cria o material usando a textura carregada (Standard reage às luzes)
    const materialParede = new THREE.MeshStandardMaterial({ 
        map: texturaParede,
        roughness: 0.8
    });

    // Geometria padrão do bloco de parede
    const geometriaParede = new THREE.BoxGeometry(TAMANHO_BLOCO, ALTURA_PAREDE, TAMANHO_BLOCO);

    // Loop para ler a matriz e erguer as paredes na cena
    for (let linha = 0; linha < MAPA.length; linha++) {
        for (let coluna = 0; coluna < MAPA[linha].length; coluna++) {
            if (MAPA[linha][coluna] === 1) {
                const blocoWall = new THREE.Mesh(geometriaParede, materialParede);
                
                // Calcula a posição 3D baseada na linha e coluna da matriz
                blocoWall.position.x = coluna * TAMANHO_BLOCO;
                blocoWall.position.y = ALTURA_PAREDE / 2; // Sobe o bloco para ficar apoiado no chão
                blocoWall.position.z = linha * TAMANHO_BLOCO;
                
                scene.add(blocoWall);
            }
        }
    }

    // Chão simples e escuro sob o labirinto
    const geometriaChao = new THREE.PlaneGeometry(100, 100);
    const materialChao = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const chao = new THREE.Mesh(geometriaChao, materialChao);
    chao.rotation.x = -Math.PI / 2;
    scene.add(chao);

    // ==========================================
    // 7. INICIALIZAÇÃO DOS CONTROLES
    // ==========================================
    initPlayerControls(camera, scene);

    // ==========================================
    // 8. ESCONDER A TELA DE CARREGAMENTO
    // ==========================================
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
// 9. GAME LOOP (Atualiza a cada frame)
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    // Move o jogador baseado no teclado/mouse
    updatePlayerMovement(deltaTime, camera);

    renderer.render(scene, camera);
}

init();
animate();
