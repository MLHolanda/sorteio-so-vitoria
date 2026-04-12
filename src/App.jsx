import { useState, useEffect, useCallback } from 'react'
import './App.css'

function formatarTempo(totalSegundos) {
  const m = Math.floor(totalSegundos / 60)
  const s = totalSegundos % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function App() {
  // Carrega os jogadores do computador (LocalStorage)
  const [jogadores, setJogadores] = useState(() => {
    const salvos = localStorage.getItem('banco_jogadores');
    return salvos ? JSON.parse(salvos) : [];
  });
  
  const [novoNome, setNovoNome] = useState('')

  const [segundosCronometro, setSegundosCronometro] = useState(0)
  const [cronometroRodando, setCronometroRodando] = useState(false)

  useEffect(() => {
    if (!cronometroRodando) return
    const id = setInterval(() => {
      setSegundosCronometro((t) => t + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [cronometroRodando])

  const alternarCronometro = useCallback(() => {
    setCronometroRodando((r) => !r)
  }, [])

  const zerarCronometro = useCallback(() => {
    setCronometroRodando(false)
    setSegundosCronometro(0)
  }, [])

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

    const embaralhados = presentes.sort(() => Math.random() - 0.5);
    const timeA = embaralhados.slice(0, 5);
    const timeB = embaralhados.slice(5, 10);

    alert(`⚽ TIME A: ${timeA.map(j => j.nome).join(', ')}\n\n⚽ TIME B: ${timeB.map(j => j.nome).join(', ')}`);
  };

  const desmarcarTodos = () => {
    const resetados = jogadores.map(j => ({ ...j, selecionado: false }));
    setJogadores(resetados);
  };

  const limparBanco = () => {
    // Abre uma caixa de texto para o usuário digitar
    const senha = prompt("Atenção: Isso apagará TODOS os nomes. Digite a senha para confirmar:");

    // Aqui usamos a lógica de condição (igual ao 'if' da sua Aula 10 de Python!)
    if (senha === "1020") { // Você pode trocar "1020" pela senha que quiser
      setJogadores([]);
      alert("Banco de dados limpo com sucesso!");
    } else {
      alert("Senha incorreta! Seus jogadores estão salvos.");
    }
  };

  
  return (
    <div className="container">
      <h1>⚽ Sorteio do Rachão</h1>

      <section className="timer-card" aria-label="Cronômetro do jogo">
        <div className="timer-card__header">
          <span
            className={
              cronometroRodando
                ? 'timer-card__badge timer-card__badge--on'
                : segundosCronometro > 0
                  ? 'timer-card__badge timer-card__badge--pause'
                  : 'timer-card__badge'
            }
          >
            {cronometroRodando
              ? 'Em andamento'
              : segundosCronometro > 0
                ? 'Pausado'
                : 'Pronto'}
          </span>
          <h2 className="timer-card__title">Tempo de jogo</h2>
        </div>
        <p
          className="timer-card__display"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatarTempo(segundosCronometro)}
        </p>
        <div className="timer-card__actions">
          <button
            type="button"
            className="timer-btn timer-btn--primary"
            onClick={alternarCronometro}
          >
            {cronometroRodando ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            type="button"
            className="timer-btn timer-btn--ghost"
            onClick={zerarCronometro}
          >
            Zerar
          </button>
        </div>
      </section>
      
      <div className="input-group">
        <input 
          type="text" 
          value={novoNome} 
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome do jogador..."
        />
        <button className="btn-add" onClick={adicionarJogador}>Cadastrar</button>
      </div>

      <h3>Quem chegou para o jogo? (Marque 10)</h3>
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
