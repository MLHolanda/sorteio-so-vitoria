import { useState, useEffect, useCallback } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import './App.css'

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

    if (!salvo) {
      return {
        segundosCronometro: 0,
        timesSorteados: null,
        placarAzul: 0,
        placarLaranja: 0,
      }
    }

    const dados = JSON.parse(salvo)

    return {
      segundosCronometro: Number(dados.segundosCronometro) || 0,
      timesSorteados: dados.timesSorteados || null,
      placarAzul: Number(dados.placarAzul) || 0,
      placarLaranja: Number(dados.placarLaranja) || 0,
    }
  } catch {
    return {
      segundosCronometro: 0,
      timesSorteados: null,
      placarAzul: 0,
      placarLaranja: 0,
    }
  }
}

function App() {
  const estadoInicialPartida = carregarEstadoPartida()

  const [jogadores, setJogadores] = useState(() => {
    try {
      const salvos = localStorage.getItem('banco_jogadores')
      const lista = salvos ? JSON.parse(salvos) : []
      return normalizarJogadores(lista)
    } catch {
      return []
    }
  })

  const [novoNome, setNovoNome] = useState('')
  const [segundosCronometro, setSegundosCronometro] = useState(
    estadoInicialPartida.segundosCronometro
  )
  const [cronometroRodando, setCronometroRodando] = useState(false)
  const [timesSorteados, setTimesSorteados] = useState(
    estadoInicialPartida.timesSorteados
  )
  const [placarAzul, setPlacarAzul] = useState(estadoInicialPartida.placarAzul)
  const [placarLaranja, setPlacarLaranja] = useState(
    estadoInicialPartida.placarLaranja
  )

  const totalSelecionados = jogadores.filter((j) => j.selecionado).length

  useEffect(() => {
    localStorage.setItem('banco_jogadores', JSON.stringify(jogadores))
  }, [jogadores])

  useEffect(() => {
    const estadoPartida = {
      segundosCronometro,
      timesSorteados,
      placarAzul,
      placarLaranja,
    }

    localStorage.setItem('estado_partida', JSON.stringify(estadoPartida))
  }, [segundosCronometro, timesSorteados, placarAzul, placarLaranja])

  useEffect(() => {
    if (!cronometroRodando) return

    const intervalo = setInterval(() => {
      setSegundosCronometro((tempo) => tempo + 1)
    }, 1000)

    return () => clearInterval(intervalo)
  }, [cronometroRodando])

  const alternarCronometro = useCallback(() => {
    setCronometroRodando((estadoAtual) => !estadoAtual)
  }, [])

  const zerarCronometro = useCallback(() => {
    setCronometroRodando(false)
    setSegundosCronometro(0)
  }, [])

  const adicionarJogador = () => {
    const nomeLimpo = novoNome.trim()

    if (!nomeLimpo) {
      toast.error('Digite o nome do jogador.')
      return
    }

    const nomeJaExiste = jogadores.some(
      (jogador) => jogador.nome.toLowerCase() === nomeLimpo.toLowerCase()
    )

    if (nomeJaExiste) {
      toast.error('Esse jogador já está cadastrado.')
      return
    }

    setJogadores((listaAtual) => [
      ...listaAtual,
      {
        id: gerarId(),
        nome: nomeLimpo,
        selecionado: false,
      },
    ])

    setNovoNome('')
    toast.success('Jogador cadastrado com sucesso.')
  }

  const alternarPresenca = (id) => {
    setJogadores((listaAtual) =>
      listaAtual.map((jogador) =>
        jogador.id === id
          ? { ...jogador, selecionado: !jogador.selecionado }
          : jogador
      )
    )
  }

  const editarJogador = (id) => {
    const jogadorAtual = jogadores.find((j) => j.id === id)
    if (!jogadorAtual) return

    const novoNomeEditado = prompt('Editar nome do jogador:', jogadorAtual.nome)

    if (novoNomeEditado === null) return

    const nomeLimpo = novoNomeEditado.trim()

    if (!nomeLimpo) {
      toast.error('O nome não pode ficar vazio.')
      return
    }

    const nomeDuplicado = jogadores.some(
      (j) =>
        j.id !== id &&
        j.nome.trim().toLowerCase() === nomeLimpo.toLowerCase()
    )

    if (nomeDuplicado) {
      toast.error('Já existe outro jogador com esse nome.')
      return
    }

    setJogadores((listaAtual) =>
      listaAtual.map((jogador) =>
        jogador.id === id ? { ...jogador, nome: nomeLimpo } : jogador
      )
    )

    setTimesSorteados((timesAtuais) => {
      if (!timesAtuais) return null

      return {
        timeA: timesAtuais.timeA.map((j) =>
          j.id === id ? { ...j, nome: nomeLimpo } : j
        ),
        timeB: timesAtuais.timeB.map((j) =>
          j.id === id ? { ...j, nome: nomeLimpo } : j
        ),
      }
    })

    toast.success('Jogador atualizado com sucesso.')
  }

  const excluirJogador = (id) => {
    const jogador = jogadores.find((j) => j.id === id)
    if (!jogador) return

    const confirmar = window.confirm(`Excluir ${jogador.nome}?`)
    if (!confirmar) return

    setJogadores((listaAtual) => listaAtual.filter((j) => j.id !== id))

    setTimesSorteados((timesAtuais) => {
      if (!timesAtuais) return null

      const timeA = timesAtuais.timeA.filter((j) => j.id !== id)
      const timeB = timesAtuais.timeB.filter((j) => j.id !== id)

      if (timeA.length !== 5 || timeB.length !== 5) {
        return null
      }

      return { timeA, timeB }
    })

    toast.success('Jogador excluído com sucesso.')
  }

  const sortearOsDez = () => {
    const presentes = jogadores.filter((j) => j.selecionado)

    if (presentes.length !== 10) {
      toast.error(`Selecione exatamente 10 jogadores. Atualmente: ${presentes.length}.`)
      return
    }

    const embaralhados = [...presentes].sort(() => Math.random() - 0.5)

    setTimesSorteados({
      timeA: embaralhados.slice(0, 5),
      timeB: embaralhados.slice(5, 10),
    })

    setPlacarAzul(0)
    setPlacarLaranja(0)
    zerarCronometro()
    toast.success('Equipes sorteadas com sucesso.')
  }

  const desmarcarTodos = () => {
    setJogadores((listaAtual) =>
      listaAtual.map((jogador) => ({
        ...jogador,
        selecionado: false,
      }))
    )

    toast.success('Seleção limpa com sucesso.')
  }

  const limparTimes = () => {
    setTimesSorteados(null)
    setPlacarAzul(0)
    setPlacarLaranja(0)
    zerarCronometro()
    toast.success('Equipes sorteadas e placar limpos com sucesso.')
  }

  const limparBanco = () => {
    const senha = prompt(
      'Atenção: isso apagará todos os jogadores. Digite a senha para confirmar:'
    )

    if (senha === '1020') {
      setJogadores([])
      setTimesSorteados(null)
      setPlacarAzul(0)
      setPlacarLaranja(0)
      zerarCronometro()
      localStorage.removeItem('banco_jogadores')
      localStorage.removeItem('estado_partida')
      toast.success('Banco apagado com sucesso.')
    } else {
      toast.error('Senha incorreta.')
    }
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '14px',
          },
        }}
      />

      <div className="app">
        <div className="container">
          <header className="hero">
            <h1>⚽ Sorteio Só Vitória</h1>
            <p className="subtitulo">
              Monte a pelada, marque os 10 presentes e faça o sorteio das equipes.
            </p>
          </header>

          <section className="topo-grid">
            <div className="card">
              <div className="card-topo">
                <span className={cronometroRodando ? 'badge ativo' : 'badge'}>
                  {cronometroRodando ? 'Em andamento' : 'Pronto'}
                </span>
                <h2>Tempo de jogo</h2>
              </div>

              <div className="timer-display">{formatarTempo(segundosCronometro)}</div>

              <div className="timer-actions">
                <button className="btn dark" onClick={alternarCronometro}>
                  {cronometroRodando ? 'Pausar' : 'Iniciar'}
                </button>
                <button className="btn light" onClick={zerarCronometro}>
                  Zerar
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-topo">
                <span className="badge destaque">Placar</span>
                <h2>Jogo atual</h2>
              </div>

              <div className="placar">
                <div className="placar-time azul">
                  <h3>Azul</h3>
                  <strong>{placarAzul}</strong>
                  <div className="placar-botoes">
                    <button className="btn mini" onClick={() => setPlacarAzul((v) => v + 1)}>
                      + Gol
                    </button>
                    <button
                      className="btn mini light"
                      onClick={() => setPlacarAzul((v) => (v > 0 ? v - 1 : 0))}
                    >
                      - Gol
                    </button>
                  </div>
                </div>

                <div className="placar-versus">x</div>

                <div className="placar-time laranja">
                  <h3>Laranja</h3>
                  <strong>{placarLaranja}</strong>
                  <div className="placar-botoes">
                    <button className="btn mini" onClick={() => setPlacarLaranja((v) => v + 1)}>
                      + Gol
                    </button>
                    <button
                      className="btn mini light"
                      onClick={() => setPlacarLaranja((v) => (v > 0 ? v - 1 : 0))}
                    >
                      - Gol
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {timesSorteados && (
            <section className="times-section">
              <div className="time-card azul-card">
                <h3>Equipe Azul 🔵</h3>
                <ul>
                  {timesSorteados.timeA.map((jogador) => (
                    <li key={jogador.id}>{jogador.nome}</li>
                  ))}
                </ul>
              </div>

              <div className="time-card laranja-card">
                <h3>Equipe Laranja 🟠</h3>
                <ul>
                  {timesSorteados.timeB.map((jogador) => (
                    <li key={jogador.id}>{jogador.nome}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <section className="card cadastro-card">
            <div className="card-topo">
              <span className="badge">Cadastro</span>
              <h2>Adicionar jogador</h2>
            </div>

            <div className="input-group">
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && adicionarJogador()}
                placeholder="Digite o nome do jogador"
              />
              <button className="btn success" onClick={adicionarJogador}>
                Cadastrar
              </button>
            </div>
          </section>

          <section className="card banco-card">
            <div className="card-topo">
              <span className="badge destaque">
                {jogadores.length} jogadores • {totalSelecionados} presentes
              </span>
              <h2>Banco de jogadores</h2>
            </div>

            {jogadores.length === 0 ? (
              <p className="vazio">Nenhum jogador cadastrado ainda.</p>
            ) : (
              <div className="lista-banco">
                {jogadores.map((jogador) => (
                  <div
                    key={jogador.id}
                    className={jogador.selecionado ? 'jogador-card ativo' : 'jogador-card'}
                  >
                    <button
                      className="jogador-nome"
                      onClick={() => alternarPresenca(jogador.id)}
                      title="Marcar ou desmarcar presença"
                    >
                      {jogador.nome}
                      {jogador.selecionado ? ' ✓' : ''}
                    </button>

                    <div className="jogador-acoes">
                      <button className="acao editar" onClick={() => editarJogador(jogador.id)}>
                        Editar
                      </button>
                      <button className="acao excluir" onClick={() => excluirJogador(jogador.id)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="acoes-principais">
            <button className="btn principal" onClick={sortearOsDez}>
              Sortear 2 equipes de 5
            </button>

            <button className="btn secondary" onClick={desmarcarTodos}>
              Limpar seleção
            </button>

            <button className="btn secondary" onClick={limparTimes}>
              Limpar equipes sorteadas
            </button>

            <button className="btn danger" onClick={limparBanco}>
              Apagar banco
            </button>
          </section>
        </div>
      </div>
    </>
  )
}

export default App