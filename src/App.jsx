import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // --- LÓGICA DO BANCO DE DADOS E JOGADORES ---
  const [jogadores, setJogadores] = useState(() => {
    const salvos = localStorage.getItem('banco_jogadores');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [novoNome, setNovoNome] = useState('');
  const [timesSorteados, setTimesSorteados] = useState(null);

  // --- LÓGICA DO TIMER ---
  const [segundos, setSegundos] = useState(0);
  const [timerAtivo, setTimerAtivo] = useState(false);

  useEffect(() => {
    localStorage.setItem('banco_jogadores', JSON.stringify(jogadores));
  }, [jogadores]);

  useEffect(() => {
    let intervalo = null;
    if (timerAtivo) {
      intervalo = setInterval(() => setSegundos(s => s + 1), 1000);
    } else {
      clearInterval(intervalo);
    }
    return () => clearInterval(intervalo);
  }, [timerAtivo]);

  const formatarTempo = () => {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- FUNÇÕES DE AÇÃO ---
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
      alert(`Selecione exatamente 10 jogadores! (Marcados: ${presentes.length})`);
      return;
    }
    const embaralhados = [...presentes].sort(() => Math.random() - 0.5);
    setTimesSorteados({
      timeA: embaralhados.slice(0, 5),
      timeB: embaralhados.slice(5, 10)
    });
  };

  return (
    <div className="container">
      <h1>⚽ Sorteio do Rachão</h1>

      {/* SEÇÃO DO TIMER */}
      <div className="timer-box">
        <h2 className="display-timer">{formatarTempo()}</h2>
        <div className="timer-btns">
          <button onClick={() => setTimerAtivo(true)}>▶ Iniciar</button>
          <button onClick={() => setTimerAtivo(false)}>⏸ Pausar</button>
          <button onClick={() => {setTimerAtivo(false); setSegundos(0)}}>🔄 Zerar</button>
        </div>
      </div>
      
      <div className="input-group">
        <input 
          type="text" 
          value={novoNome} 
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome do jogador..."
        />
        <button className="btn-add" onClick={adicionarJogador}>Cadastrar</button>
      </div>

      {/* EXIBIÇÃO DOS TIMES SORTEADOS COM CORES */}
      {timesSorteados && (
        <div className="painel-times">
          <div className="coluna-time time-azul">
            <h3>Time Azul 🔵</h3>
            {timesSorteados.timeA.map((j, i) => <p key={i}>{j.nome}</p>)}
          </div>
          <div className="coluna-time time-laranja">
            <h3>Time Laranja 🟠</h3>
            {timesSorteados.timeB.map((j, i) => <p key={i}>{j.nome}</p>)}
          </div>
        </div>
      )}

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
        <button className="btn-sortear" onClick={sortearOsDez}>Sortear Partida</button>
        <button className="btn-reset" onClick={() => setJogadores(jogadores.map(j => ({ ...j, selecionado: false })))}>Limpar Seleção</button>
      </div>
    </div>
  )
} 

export default App
