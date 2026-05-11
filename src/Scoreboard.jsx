// src/Scoreboard.jsx
function Scoreboard({ timeA, timeB, golsA, golsB, corA, corB, aoGolA, aoGolB }) {
  return (
    <div className="placar-container">
      <div className="time-placar" style={{ borderTop: `5px solid ${corA}` }}>
        <h3>{timeA}</h3>
        <div className="gols">{golsA}</div>
        <button onClick={() => aoGolA(1)}>+ Gol</button>
        <button onClick={() => aoGolA(-1)}>- Gol</button>
      </div>

      <div className="versus">X</div>

      <div className="time-placar" style={{ borderTop: `5px solid ${corB}` }}>
        <h3>{timeB}</h3>
        <div className="gols">{golsB}</div>
        <button onClick={() => aoGolB(1)}>+ Gol</button>
        <button onClick={() => aoGolB(-1)}>- Gol</button>
      </div>
    </div>
  );
}

export default Scoreboard;
