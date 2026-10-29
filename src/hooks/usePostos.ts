import {useEffect, useState} from 'react';
import {Posto, postosDaCidade} from '../lib/postos';
import {carregarPostos} from '../services/postos.service';

export type EstadoPostos = 'inativo' | 'carregando' | 'ok' | 'indisponivel';

/** Postos mais baratos da cidade escolhida (dados da ANP por UF). */
export default function usePostos(uf: string | null, cidade: string | null) {
  const [estado, setEstado] = useState<EstadoPostos>('inativo');
  const [postos, setPostos] = useState<Posto[]>([]);

  useEffect(() => {
    if (!uf || !cidade) {
      setEstado('inativo');
      setPostos([]);
      return;
    }
    let ativo = true;
    setEstado('carregando');
    carregarPostos(uf).then((lista) => {
      if (!ativo) {
        return;
      }
      setPostos(postosDaCidade(lista, cidade));
      setEstado(lista ? 'ok' : 'indisponivel');
    });
    return () => {
      ativo = false;
    };
  }, [uf, cidade]);

  return {estado, postos};
}
