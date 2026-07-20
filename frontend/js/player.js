// player.js - Lógica de movimento, visão e COLISÃO por grade
import * as THREE from 'three';

const keys = {}; 
let isMouseLocked = false;
const moveSpeed = 5; 
let playerVelocity = new THREE.Vector3(); 

export function initPlayerControls(camera, scene) {
    const gameContainer = document.getElementById('game-container');

    gameContainer.addEventListener('click', () => {
        if (!isMouseLocked) {
            gameContainer.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === gameContainer) {
            isMouseLocked = true;
        } else {
            isMouseLocked = false;
        }
    });

    const euler = new THREE.Euler(0, 0, 0, 'YXZ'); 

    document.addEventListener('mousemove', (event) => {
        if (!isMouseLocked) return; 

        const movementX = event.movementX || 0; 
        const movementY = event.movementY || 0; 
        const mouseSensitivity = 0.002; 

        euler.y -= movementX * mouseSensitivity; 
        euler.x -= movementY * mouseSensitivity; 

        const PI_2 = Math.PI / 2;
        euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));

        camera.quaternion.setFromEuler(euler);
    });

    document.addEventListener('keydown', (event) => {
        keys[event.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key.toLowerCase()] = false;
    });
}

/**
 * Função de atualização modificada para aceitar o MAPA e calcular colisões deslizantes
 */
export function updatePlayerMovement(deltaTime, camera, MAPA, TAMANHO_BLOCO) {
    if (!isMouseLocked) return; 

    playerVelocity.set(0, 0, 0);

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    forward.y = 0; 
    forward.normalize(); 

    right.crossVectors(forward, camera.up);

    if (keys['w'] || keys['arrowup']) playerVelocity.add(forward);
    if (keys['s'] || keys['arrowdown']) playerVelocity.add(forward.clone().multiplyScalar(-1)); 
    if (keys['d'] || keys['arrowright']) playerVelocity.add(right);
    if (keys['a'] || keys['arrowleft']) playerVelocity.add(right.clone().multiplyScalar(-1)); 

    playerVelocity.normalize(); 
    playerVelocity.multiplyScalar(moveSpeed); 

    // ==========================================
    // SISTEMA DE COLISÃO POR GRADE (SLIDING COLLISION)
    // ==========================================
    const deslocamento = playerVelocity.clone().multiplyScalar(deltaTime);
    const raioJogador = 0.4; // Distância mínima para não grudar na parede

    // 1. Testar e aplicar movimento no Eixo X
    const proximoX = camera.position.x + deslocamento.x;
    const sinalX = deslocamento.x > 0 ? 1 : -1;
    // Calcula qual coluna o jogador colidiria usando o raio do corpo dele
    const colTeste = Math.round((proximoX + sinalX * raioJogador) / TAMANHO_BLOCO);
    const linAtual = Math.round(camera.position.z / TAMANHO_BLOCO);

    let colisaoX = false;
    if (MAPA[linAtual] && MAPA[linAtual][colTeste] === 1) {
        colisaoX = true;
    }
    if (!colisaoX) {
        camera.position.x = proximoX;
    }

    // 2. Testar e aplicar movimento no Eixo Z
    const proximoZ = camera.position.z + deslocamento.z;
    const sinalZ = deslocamento.z > 0 ? 1 : -1;
    // Calcula qual linha o jogador colidiria
    const linTeste = Math.round((proximoZ + sinalZ * raioJogador) / TAMANHO_BLOCO);
    const colAtual = Math.round(camera.position.x / TAMANHO_BLOCO);

    let colisaoZ = false;
    if (MAPA[linTeste] && MAPA[linTeste][colAtual] === 1) {
        colisaoZ = true;
    }
    if (!colisaoZ) {
        camera.position.z = proximoZ;
    }
}
