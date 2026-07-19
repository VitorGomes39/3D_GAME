# server.py - O Backend do seu jogo em Python

import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# CORS permite que o frontend (no navegador) converse com o backend sem ser bloqueado por segurança
CORS(app) 

DB_NAME = "database.db"

def init_db():
    """
    Cria o arquivo database.db e a tabela de jogadores se eles não existirem.
    """
    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()
    
    # Cria a tabela para salvar o progresso
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jogadores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            sala INTEGER NOT NULL,
            pontos INTEGER NOT NULL
        )
    ''')
    conexao.commit()
    conexao.close()
    print("Banco de dados pronto para uso!")

# ==========================================
# ROTAS (A API que o JS chama)
# ==========================================

@app.route('/salvar', methods=['POST'])
def salvar_progresso():
    dados = request.get_json()
    
    nome = dados.get('jogador')
    sala = dados.get('sala')
    pontos = dados.get('pontos')
    
    if not nome:
        return jsonify({"erro": "Nome do jogador é obrigatório"}), 400
        
    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()
    
    # Verifica se o jogador já existe para atualizar, ou cria um novo
    cursor.execute("SELECT id FROM jogadores WHERE nome = ?", (nome,))
    jogador_existente = cursor.fetchone()
    
    if jogador_existente:
        cursor.execute("UPDATE jogadores SET sala = ?, pontos = ? WHERE nome = ?", (sala, pontos, nome))
    else:
        cursor.execute("INSERT INTO jogadores (nome, sala, pontos) VALUES (?, ?, ?)", (nome, sala, pontos))
        
    conexao.commit()
    conexao.close()
    
    return jsonify({"mensagem": "Progresso salvo com sucesso!", "jogador": nome})

@app.route('/leaderboard', methods=['GET'])
def buscar_leaderboard():
    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()
    
    # Busca os top 10 jogadores com mais pontos
    cursor.execute("SELECT nome, sala, pontos FROM jogadores ORDER BY pontos DESC LIMIT 10")
    resultados = cursor.fetchall()
    conexao.close()
    
    # Formata os dados para enviar de volta ao JavaScript
    ranking = [{"jogador": linha[0], "sala": linha[1], "pontos": linha[2]} for linha in resultados]
    
    return jsonify(ranking)

# ==========================================
# INICIALIZAÇÃO
# ==========================================

if __name__ == '__main__':
    # Antes de ligar o servidor, prepara o banco de dados
    init_db()
    # Roda o servidor na porta 5000 (a mesma configurada no seu api.js)
    app.run(debug=True, port=5000)
