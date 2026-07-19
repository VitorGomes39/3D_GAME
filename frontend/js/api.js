// api.js - O canal de comunicação entre o Frontend (JS) e o Backend (Python)

// O endereço do nosso futuro servidor Python (ex: Flask rodando localmente).
// Quando você hospedar o jogo na internet, mudará isso para o link real (ex: https://meujogo.com/api).
const BASE_URL = 'http://127.0.0.1:5000';

/**
 * Envia o progresso do jogador para o servidor Python salvar no banco de dados.
 * @param {string} nomeJogador - O nome do jogador.
 * @param {number} salaAtual - O número da sala onde ele está (para saves).
 * @param {number} pontuacao - Quantidade de quebra-cabeças resolvidos ou tempo.
 */
export async function salvarProgresso(nomeJogador, salaAtual, pontuacao) {
    console.log(`Tentando salvar o progresso do jogador ${nomeJogador}...`);
    
    try {
        const resposta = await fetch(`${BASE_URL}/salvar`, {
            method: 'POST', // POST significa que estamos ENVIANDO dados
            headers: {
                'Content-Type': 'application/json' // Avisa o Python que estamos mandando um JSON
            },
            body: JSON.stringify({
                jogador: nomeJogador,
                sala: salaAtual,
                pontos: pontuacao
            })
        });

        if (!resposta.ok) {
            throw new Error(`Erro no servidor: ${resposta.status}`);
        }

        const dados = await resposta.json();
        console.log("Progresso salvo com sucesso no servidor Python!", dados);
        return dados;

    } catch (erro) {
        // Como o servidor Python ainda não está rodando, esse erro vai aparecer no console.
        // Isso é normal e impede que o jogo trave por falta de internet.
        console.warn("Não foi possível salvar o progresso. O servidor Python está rodando?", erro);
        return null; 
    }
}

/**
 * Busca o ranking de jogadores (Leaderboard) no servidor.
 * Pode ser usado para mostrar os melhores jogadores na tela de título.
 */
export async function buscarLeaderboard() {
    console.log("Buscando leaderboard do servidor...");
    
    try {
        // Um simples fetch sem 'method' faz um GET automático (só pede dados)
        const resposta = await fetch(`${BASE_URL}/leaderboard`);
        
        if (!resposta.ok) {
            throw new Error(`Erro ao buscar ranking: ${resposta.status}`);
        }

        const dados = await resposta.json();
        return dados;

    } catch (erro) {
        console.warn("Falha ao carregar o leaderboard do servidor.", erro);
        // Retorna uma lista vazia falsa para não quebrar a tela de ranking do jogo
        return [
            { jogador: "FANTASMA_LOCAL", sala: 99, pontos: 9999 }
        ]; 
    }
}
