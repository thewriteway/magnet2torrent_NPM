import PeerDiscovery from 'torrent-discovery';
import { randomBytes } from 'crypto';
import { getMetadata } from './metadata.js';

let connecting = true;
let gotNoPeers = true;

function torrentDiscovery(torrent, connectingSpinner, metadataSpinner) {
  const infoHash = torrent.infoHash;
  console.log(torrent)
  const peerId = randomBytes(20);

  return new Promise((resolve, reject) => {
    const discovery = new PeerDiscovery({
      peerId,
      infoHash,
      dht: true,
      tracker: true,
      port: 6881,
      announce: torrent.announce || [],
    });

    discovery.on('peer', addr => {
      connecting && connectingSpinner.succeed();
      gotNoPeers && metadataSpinner.start();

      connecting = false;
      gotNoPeers = false;

      const [address, port] = addr.split(':');
      getMetadata(port, address, infoHash, peerId.toString('hex'), metadata => {
        discovery.destroy();
        resolve(metadata);
      });
    });
  });
}

export { torrentDiscovery };
