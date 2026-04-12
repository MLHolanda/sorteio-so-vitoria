import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Carrega os jogadores do LocalStorage (Banco de Dados do Navegador)
  const [jogadores, setJogadores] = useState(() => {
    const salvos = localStorage.getItem('banco_jogadores');
    return salvos ? JSON.parse(salvos) : [];
  });
  
  const [novoNome, setNovoNome] = useState('');

  // Salva no computador sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem('banco_jogadores', JSON.stringify(jogadores));
  }, [jogadores]);

  const adicionarJogador = () => {
    if (novoNome.trim() !== "") {
      setJogadores([...jogadores, { nome: novoNome, selecionado: false }]);
      setNovoNome('');
    }
  };

  const alternarPresenca = (index) => {
    const novaLista = [...jogadores];
    novaLista[index].selecionado = !novaLista[index].selecionado;
    setJogadores(novaLista);
  };

  const sortearOsDez = () => {
    const presentes = jogadores.filter(j => j.selecionado);
    
    if (presentes.length !== 10) {
      alert(`Selecione exatamente 10 jogadores! (Você marcou ${presentes.length})`);
      return;
    }

    const embaralhados = [...presentes].sort(() => Math.random() - 0.5);
    const timeA = embaralhados.slice(0, 5);
    const timeB = embaralhados.slice(5, 10);

    alert(`⚽ TIME A: ${timeA.map(j => j.nome).join(', ')}\n\n⚽ TIME B: ${timeB.map(j => j.nome).join(', ')}`);
  };

  const desmarcarTodos = () => {
    const resetados = jogadores.map(j => ({ ...j, selecionado: false }));
    setJogadores(resetados);
  };

  const limparBanco = () => {
    const senha = prompt("Atenção: Isso apagará TODOS os nomes. Digite a senha para confirmar:");
    if (senha === "1020") {
      setJogadores([]);
      alert("Banco de dados limpo com sucesso!");
    } else if (senha !== null) {
      alert("Senha incorreta!");
    }
  };

  return (
    <div className="container">
      <h1>⚽ Sorteio do Rachão</h1>
      
      <div className="input-group">
        <input 
          type="text" 
          value={novoNome} 
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome do jogador..."
        />
        <button className="btn-add" onClick={adicionarJogador}>Cadastrar</button>
      </div>

      <h3>Quem chegou? (Marque 10)</h3>
      <div className="lista-banco">
        {jogadores.map((jogador, index) => (
          <button 
            key={index} 
            onClick={() => alternarPresenca(index)}
            className={jogador.selecionado ? "card-ativo" : "card-inativo"}
          >
            {jogador.nome}
          </button>
        ))}
      </div>

      <div className="acoes">
        <button className="btn-sortear" onClick={sortearOsDez}>
          Sortear 2 Times de 5
        </button>
        
        <button className="btn-reset" onClick={desmarcarTodos}>
          Limpar Seleção
        </button>

        <button className="btn-limpar" onClick={limparBanco}>
          Apagar Banco
        </button>
      </div>
    </div>
  )
}

export default App
