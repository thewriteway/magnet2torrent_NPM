import { program } from 'commander';
import { getTorrent } from './utils/torrent.js';

program
.argument('<magnet>', 'full magnet uri or info hash only')
.option('-o, --output <filename>', 'torrent file output')
.action(magnet => getTorrent(magnet, program.opts().output))
.parse();