import { criarApp } from './app.js';
import { config } from './config.js';
import { migrarProducao } from './db/migrate.js';

await migrarProducao();
criarApp().listen(config.PORT, () => console.log(`Hollow Page rodando em http://localhost:${config.PORT}`));
