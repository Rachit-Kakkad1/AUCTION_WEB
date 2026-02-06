
function mulberry32(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
}

function seededShuffle(array, seed) {
    const shuffled = [...array];
    const random = mulberry32(hashString(seed));

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

const testArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const seed1 = 'auction-test-seed-1';
const seed2 = 'auction-test-seed-2';

console.log('Original:', testArray.join(','));
console.log('Shuffled 1:', seededShuffle(testArray, seed1).join(','));
console.log('Shuffled 2:', seededShuffle(testArray, seed2).join(','));
