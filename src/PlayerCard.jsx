// src/PlayerCard.jsx
import React from 'react';

function PlayerCard({ jogador, aoAlternar, aoEditar, aoExcluir }) {
  return (
    <div className="wrapper-player">
      <button 
        onClick={() => aoAlternar(jogador.id)}
        className={jogador.selecionado ? "card-ativo" : "card-inativo"}
      >
        {jogador.nome}
      </button>
      
      <span onClick={() => aoEditar(jogador.id)} className="btn-edit" title="Editar">
        ✏️
      </span>
      
      <span onClick={() => aoExcluir(jogador.id)} className="btn-delete" title="Excluir">
        ×
      </span>
    </div>
  );
}

export default PlayerCard;
