import {useEffect, useMemo, useState} from 'react';
import {precoParaTexto, resolverPreco, temPreco} from '../lib/precos';
import {Carregamento, carregarPrecos} from '../services/precos.service';

export const BRASIL = 'BR';

/** Carrega os preços da ANP e mantém estado, cidade e preços digitados. */
export default function useLocalPrecos() {
  const [dados, setDados] = useState<Carregamento | null>(null);
  const [uf, setUf] = useState<string | null>(null);
  const [cidade, setCidade] = useState<string | null>(null);
  const [gasolina, setGasolina] = useState('');
  const [etanol, setEtanol] = useState('');

  const preencher = (g: number, e: number) => {
    setGasolina(precoParaTexto(g));
    setEtanol(precoParaTexto(e));
  };

  useEffect(() => {
    let ativo = true;
    carregarPrecos().then((carregado) => {
      if (ativo) {
        setDados(carregado);
        preencher(
          carregado.precos.brasil.gasolina,
          carregado.precos.brasil.etanol,
        );
      }
    });
    return () => {
      ativo = false;
    };
  }, []);

  const precos = dados?.precos ?? null;
  const estado = precos?.estados.find((e) => e.uf === uf);

  const opcoesEstado = useMemo(
    () => [
      {valor: BRASIL, rotulo: 'Brasil (média nacional)'},
      ...(precos?.estados ?? []).map((e) => ({
        valor: e.uf,
        rotulo: `${e.nome} (${e.uf})`,
      })),
    ],
    [precos],
  );
  const opcoesCidade = useMemo(
    () =>
      (estado?.municipios ?? []).map((m) => ({
        valor: m.nome,
        rotulo: temPreco(m)
          ? m.nome
          : `${m.nome} · ${m.ref ? 'estimativa' : 'média do estado'}`,
      })),
    [estado],
  );

  const escolherEstado = (valor: string) => {
    setCidade(null);
    const escolhido = precos?.estados.find((e) => e.uf === valor);
    setUf(escolhido ? valor : null);
    const referencia = escolhido ?? precos?.brasil;
    if (referencia) {
      preencher(referencia.gasolina, referencia.etanol);
    }
  };

  const municipio = estado?.municipios.find((m) => m.nome === cidade);

  const escolherCidade = (nome: string) => {
    setCidade(nome);
    const escolhida = estado?.municipios.find((m) => m.nome === nome);
    if (estado && escolhida) {
      const {gasolina: g, etanol: e} = resolverPreco(estado, escolhida);
      preencher(g, e);
    }
  };

  return {
    dados,
    precos,
    estado,
    uf,
    cidade,
    gasolina,
    etanol,
    setGasolina,
    setEtanol,
    opcoesEstado,
    opcoesCidade,
    escolherEstado,
    escolherCidade,
    preencher,
    aviso: estado ? resolverPreco(estado, municipio).aviso : null,
  };
}
