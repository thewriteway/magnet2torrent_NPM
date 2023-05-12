import parseTorrent from 'parse-torrent';
import { toTorrentFile } from 'parse-torrent';
import { writeFileSync } from 'fs';
import { torrentDiscovery } from './discovery.js';
import chalk from 'chalk';
import ora from 'ora';

const spinnerData = {
  interval: 200,
  frames: ['|', '/', '-', '|', '-', '\\'],
};

const connectingSpinner = ora({
  text: 'connecting to peers',
  spinner: spinnerData,
  color: 'yellow',
});

const metadataSpinner = ora({
  text: 'getting metadata',
  spinner: spinnerData,
  color: 'yellow',
});

async function getTorrent(magnet, output) {
	try {
		magnet = await parseTorrent(magnet);
		connectingSpinner.start();

		const metadata = await torrentDiscovery(magnet, connectingSpinner, metadataSpinner);
		console.log(metadata);
		const metadataObject = await parseTorrent(metadata);
		console.log(metadataObject);

		output = output || metadataObject.name || magnet.infoHash.toUpperCase();
		const file = toTorrentFile({ ...metadataObject, announce: magnet.announce || [] });
		const filename = (/[.]/.exec(output) ? /[^.]+$/.exec(output)[0] : undefined) == 'torrent' ? output : output + '.torrent';
		writeFileSync(filename, file);

		metadataSpinner.succeed();
		console.log(chalk.green(`torrent saved as ${chalk.bold(filename)}`));
		process.exit(0);
	} catch (error) {
		connectingSpinner.stop();
		console.log(chalk.red.bold(`error: ${error.message.toLowerCase()}`));
	}
}


export { getTorrent };
