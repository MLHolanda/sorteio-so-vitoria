import { useState, useEffect, useCallback } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import './App.css'
import PlayerCard from './PlayerCard'

function formatarTempo(totalSegundos) {
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  return `${minutos}:${String(segundos).padStart(2, '0')}`
}

function gerarId() {
  return crypto.randomUUID()
}

function normalizarJogadores(lista) {
  if (!Array.isArray(lista)) return []
  return lista.map((jogador, index) => ({
    id: jogador.id || `${gerarId()}-${index}`,
    nome: jogador.nome || '',
    selecionado: Boolean(jogador.selecionado),
  }))
}

function carregarEstadoPartida() {
  try {
    const salvo = localStorage.getItem('estado_partida')
    if (!salvo) return { segundosCronometro: 0, timesSorteados: null, placarAzul: 0, placarLaranja: 0 }
    const dados = JSON.parse(salvo)
    return {
      segundosCronometro: Number(dados.segundosCronometro) || 0,
      timesSorteados: dados.timesSorteados || null,
      placarAzul: Number(dados.placarAzul) || 0,
      placarLaranja: Number(dados.placarLaranja) || 0,
    }
  } catch {
    return { segundosCronometro: 0, timesSorteados: null, placarAzul: 0, placarLaranja: 0 }
  }
}

function App() {
  const estadoInicialPartida = carregarEstadoPartida()
  
  // ESTADOS PRINCIPAIS
  const [jogadoresPorTime, setJogadoresPorTime] = useState(5)
  const [quantidadeTimes, setQuantidadeTimes] = useState(2)
  const [jogadores, setJogadores] = useState(() => {
    try {
      const salvos = localStorage.getItem('banco_jogadores')
      const lista = salvos ? JSON.parse(salvos) : []
      return normalizarJogadores(lista)
    } catch { return [] }
  })

  const [novoNome, setNovoNome] = useState('')
  const [segundosCronometro, setSegundosCronometro] = useState(estadoInicialPartida.segundosCronometro)
  const [cronometroRodando, setCronometroRodando] = useState(false)
  const [timesSorteados, setTimesSorteados] = useState(estadoInicialPartida.timesSorteados)
  const [placarAzul, setPlacarAzul] = useState(estadoInicialPartida.placarAzul)
  const [placarLaranja, setPlacarLaranja] = useState(estadoInicialPartida.placarLaranja)

  // NOVOS ESTADOS PARA O PLACAR DINÂMICO
  const [timeAtivoA, setTimeAtivoA] = useState(0)
  const [timeAtivoB, setTimeAtivoB] = useState(1)

  const totalSelecionados = jogadores.filter((j) => j.selecionado).length

  // SALVAMENTO AUTOMÁTICO
  useEffect(() => {
    localStorage.setItem('banco_jogadores', JSON.stringify(jogadores))
  }, [jogadores])

  useEffect(() => {
    const estadoPartida = { segundosCronometro, timesSorteados, placarAzul, placarLaranja }
    localStorage.setItem('estado_partida', JSON.stringify(estadoPartida))
  }, [segundosCronometro, timesSorteados, placarAzul, placarLaranja])

  // LÓGICA DO CRONÔMETRO
  useEffect(() => {
    if (!cronometroRodando) return
    const intervalo = setInterval(() => {
      setSegundosCronometro((tempo) => tempo + 1)
    }, 1000)
    return () => clearInterval(intervalo)
  }, [cronometroRodando])

  const alternarCronometro = useCallback(() => setCronometroRodando(v => !v), [])
  const zerarCronometro = useCallback(() => { setCronometroRodando(false); setSegundosCronometro(0); }, [])

  // AÇÕES DE JOGADORES
  const adicionarJogador = () => {
    const nomeLimpo = novoNome.trim()
    if (!nomeLimpo) { toast.error('Digite o nome.'); return; }
    if (jogadores.some(j => j.nome.toLowerCase() === nomeLimpo.toLowerCase())) { toast.error('Já cadastrado.'); return; }
    setJogadores(lista => [...lista, { id: gerarId(), nome: nomeLimpo, selecionado: false }])
    setNovoNome('')
  }

  const alternarPresenca = (id) => {
    setJogadores(lista => lista.map(j => j.id === id ? { ...j, selecionado: !j.selecionado } : j))
  }

  const editarJogador = (id) => {
    const j = jogadores.find(x => x.id === id)
    const novo = prompt('Editar nome:', j.nome)
    if (novo?.trim()) setJogadores(lista => lista.map(x => x.id === id ? { ...x, nome: novo.trim() } : x))
  }

  const excluirJogador = (id) => {
    if (window.confirm('Excluir?')) setJogadores(lista => lista.filter(j => j.id !== id))
  }

  // LÓGICA DE SORTEIO DINÂMICO
  const sortearTimes = () => {
    const presentes = jogadores.filter(j => j.selecionado)
    const totalNecessario = jogadoresPorTime * quantidadeTimes
    if (presentes.length < totalNecessario) {
      toast.error(`Selecione ${totalNecessario} jogadores!`);
      return
    }
    const embaralhados = [...presentes].sort(() => Math.random() - 0.5)
    const novosTimes = []
    const cores = ['#3b82f6', '#f97316', '#ef4444', '#10b981']
    
    for (let i = 0; i < quantidadeTimes; i++) {
      novosTimes.push({
        id: i,
        nome: `Equipe ${String.fromCharCode(65 + i)}`,
        cor: cores[i] || '#64748b',
        jogadores: embaralhados.slice(i * jogadoresPorTime, (i + 1) * jogadoresPorTime)
      })
    }
    setTimesSorteados(novosTimes)
    setTimeAtivoA(0)
    setTimeAtivoB(1)
    setPlacarAzul(0); setPlacarLaranja(0); zerarCronometro();
    toast.success('Sorteio realizado!')
  }

  const desmarcarTodos = () => setJogadores(l => l.map(j => ({ ...j, selecionado: false })))
  
  const limparBanco = () => {
    const senhaDigitada = prompt('Senha (1020):');
    if (senhaDigitada === import.meta.env.VITE_APP_PASSWORD) {
      setJogadores([]); setTimesSorteados(null); localStorage.clear();
      toast.success('Banco apagado.');
    } else {
      toast.error('Senha incorreta.');
    }
  }

  return (
    <div className="app">
      <Toaster position="top-center" />
      <div className="container">
        <header className="hero">
          <h1>⚽ Sorteio Só Vitória</h1>
          <p className="subtitulo">Monte a pelada e sorteie as equipes.</p>
        </header>

        <section className="topo-grid">
          <div className="card">
            <div className="card-topo">
              <span className={cronometroRodando ? 'badge ativo' : 'badge'}>
                {cronometroRodando ? 'Rodando' : 'Parado'}
              </span>
              <h2>Cronômetro</h2>
            </div>
            <div className="timer-display">{formatarTempo(segundosCronometro)}</div>
            <div className="timer-actions">
              <button className="btn dark" onClick={alternarCronometro}>{cronometroRodando ? 'Pausar' : 'Iniciar'}</button>
              <button className="btn light" onClick={zerarCronometro}>Zerar</button>
            </div>
          </div>

          <div className="card">
            <div className="card-topo"><span className="badge destaque">Placar</span><h2>Jogo atual</h2></div>
            <div className="placar">
              <div className="placar-time" style={{ borderBottom: `4px solid ${timesSorteados?.[timeAtivoA]?.cor || '#3b82f6'}` }}>
                <select 
                  className="select-placar" 
                  value={timeAtivoA} 
                  onChange={(e) => setTimeAtivoA(Number(e.target.value))}
                >
                  {timesSorteados ? timesSorteados.map(t => <option key={t.id} value={t.id}>{t.nome}</option>) : <option>Time 1</option>}
                </select>
                <strong>{placarAzul}</strong>
                <button className="btn mini" onClick={() => setPlacarAzul(v => v + 1)}>+</button>
              </div>

              <div className="placar-versus">x</div>

              <div className="placar-time" style={{ borderBottom: `4px solid ${timesSorteados?.[timeAtivoB]?.cor || '#f97316'}` }}>
                <select 
                  className="select-placar" 
                  value={timeAtivoB} 
                  onChange={(e) => setTimeAtivoB(Number(e.target.value))}
                >
                  {timesSorteados ? timesSorteados.map(t => <option key={t.id} value={t.id}>{t.nome}</option>) : <option>Time 2</option>}
                </select>
                <strong>{placarLaranja}</strong>
                <button className="btn mini" onClick={() => setPlacarLaranja(v => v + 1)}>+</button>
              </div>
            </div>
          </div>
        </section>

        {timesSorteados && (
          <section className="times-section">
            {Array.isArray(timesSorteados) ? timesSorteados.map(t => (
              <div key={t.id} className="time-card" style={{ borderTop: `5px solid ${t.cor}` }}>
                <h3 style={{color: t.cor}}>{t.nome}</h3>
                <ul>{t.jogadores.map(j => <li key={j.id}>{j.nome}</li>)}</ul>
              </div>
            )) : <p>Refaça o sorteio.</p>}
          </section>
        )}

        <section className="card cadastro-card">
          <div className="input-group">
            <input type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarJogador()} placeholder="Nome do jogador" />
            <button className="btn success" onClick={adicionarJogador}>Add</button>
          </div>
        </section>

        <section className="card banco-card">
          <div className="card-topo">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="badge destaque">
                {totalSelecionados} selecionados
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '8px' }}>
                Total no banco: {jogadores.length}
              </span>
            </div>
            <h2>Banco de jogadores</h2>
          </div>

          <div className="lista-banco">
            {jogadores.map((j) => (
              <PlayerCard 
                key={j.id} 
                jogador={j} 
                aoAlternar={alternarPresenca} 
                aoEditar={editarJogador} 
                aoExcluir={excluirJogador} 
              />
            ))}
          </div>
        </section>


        <section className="acoes-principais">
          <div className="config-box" style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
            <div style={{marginBottom: '10px'}}>
              <span>Jogadores por time: </span>
              <select value={jogadoresPorTime} onChange={e => setJogadoresPorTime(Number(e.target.value))}>
                {[5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n} x {n}</option>)}
              </select>
            </div>
            <div>
              <span>Quantidade de times: </span>
              <select value={quantidadeTimes} onChange={e => setQuantidadeTimes(Number(e.target.value))}>
                {[2,3,4].map(n => <option key={n} value={n}>{n} Equipes</option>)}
              </select>
            </div>
          </div>
          <button className="btn principal" onClick={sortearTimes} style={{width: '100%'}}>Sortear Equipes</button>
          <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <button className="btn secondary" onClick={desmarcarTodos} style={{flex:1}}>Limpar Seleção</button>
            <button className="btn danger" onClick={limparBanco} style={{flex:1}}>Apagar Banco</button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
