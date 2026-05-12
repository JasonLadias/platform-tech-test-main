import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.join(dirname, '../../.env') });
const { BACKEND_PORT } = process.env;

// eslint-disable-next-line no-console
app.listen(BACKEND_PORT, () => console.log(`Server running on port ${BACKEND_PORT}`));
