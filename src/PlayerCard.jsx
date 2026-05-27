// src/PlayerCard.jsx
import React from 'react';

function PlayerCard({ jogador, aoAlternar, aoEditar, aoExcluir }) {
  return (
    <div className="wrapper-player">

      <button
        onClick={() => aoAlternar(jogador.id)}
        className={jogador.selecionado ? 'card-ativo' : 'card-inativo'}
      >
        {jogador.nome}
      </button>

      <div className="acoes-player">
        <button
          onClick={() => aoEditar(jogador.id)}
          className="btn-edit"
          title="Editar"
        >
          ✏️
        </button>

        <button
          onClick={() => aoExcluir(jogador.id)}
          className="btn-delete"
          title="Excluir"
        >
          ×
        </button>
      </div>

    </div>
  );
}

export default PlayerCard;