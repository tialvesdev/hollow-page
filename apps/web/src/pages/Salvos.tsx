import { Link } from 'react-router-dom';
import { CAPAS } from '@hp/shared';
import { chaves } from '../api';
import { Colunas, Faixa, Vazio, useColunas } from '../ui';
import { Mural } from './Feed';

/** As artes que você guardou. Fica fora do perfil porque é privado: o perfil é a vitrine pública. */
export default function Salvos() {
  const [colunas, mudarColunas] = useColunas();
  return (
    <>
      <Faixa capa={CAPAS[5]} titulo="Salvos" />
      <div className="barra-grade"><Colunas n={colunas} mudar={mudarColunas} /></div>
      <Mural
        grade
        colunas={colunas}
        chave={chaves.salvos}
        caminho={(c) => `/usuarios/eu/salvos?limite=12${c ? `&cursor=${c}` : ''}`}
        vazio={<Vazio item="diario" titulo="Nada salvo ainda" texto="Use Salvar numa arte do mural e ela fica guardada aqui." acao={<Link className="btn sec" to="/feed">Ir ao mural</Link>} />}
      />
    </>
  );
}
