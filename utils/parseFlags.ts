export default function parseFlags(flags: string[]) {
    const index = flags.findIndex(arg => arg === '--port');
    return flags[ index + 1];
}