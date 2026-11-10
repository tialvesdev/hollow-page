import { criarApp } from './app.js';
import { config } from './config.js';
import { pool } from './db/index.js';
import { migrar } from './db/migrate.js';

await migrar(pool);
criarApp().listen(config.PORT, () => console.log(`Hollow Page rodando em http://localhost:${config.PORT}`));
