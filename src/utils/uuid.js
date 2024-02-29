import { createHash } from 'node:crypto';

const genUuidBySeed = (seed) => {
	const hash = createHash('sha256').update(seed).digest('hex');

    const uuid = [
        hash.substring(0, 8),
        hash.substring(8, 12),
        '4' + hash.substring(12, 15),
        '8' + hash.substring(15, 18),
        hash.substring(18, 30),
    ].join('-');

    return uuid;
}

export { genUuidBySeed };
