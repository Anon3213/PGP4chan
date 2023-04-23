// ==UserScript==
// @name        PGP4chan
// @author      Darwin
// @version     1.0.0
// @description Facilitates the exchange of PGP messages in 4chan threads.
// @match       *://boards.4chan.org/*
// @match       *://boards.4channel.org/*
// @require     https://unpkg.com/openpgp@5.7.0/dist/openpgp.min.js
// @run-at      document-end
// ==/UserScript==

(async () => {
    'use strict';
    // Keys have to be strictly formatted including '\n's
    const privateKeyArmored = `...private key goes here...`;
    const { readPrivateKey } = openpgp;
    const privateKey = await readPrivateKey({ armoredKey: privateKeyArmored });
    const pgpRegex = /-----BEGIN PGP MESSAGE-----[\s\S]+-----END PGP MESSAGE-----/;
    const replies = document.getElementsByClassName('postMessage');
    for (let i = 0; i < replies.length; i++) {
        const reply = replies[i].textContent ? replies[i].textContent : '';
        if (pgpRegex.test(reply)) {
            const pgpMessage = pgpRegex.exec(reply)?.toString();
            // Reformatting the raw text from a post back into the correct PGP message format including '\n's
            const formattedMessage = pgpMessage.slice(0, 27) + '\n\n' + pgpMessage.slice(27,-25) + '\n'+ pgpMessage.slice(-25);
            const { readMessage, decrypt } = openpgp;
            const decrypted = await decrypt({
                message: await readMessage({ armoredMessage: formattedMessage }),
                decryptionKeys: privateKey
            });
            replies[i].textContent = reply.replace(pgpRegex, `${decrypted.data}`);
        }
    }
})();
