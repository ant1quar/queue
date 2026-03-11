export class FileStorage {
    async write(path: string, data: string): Promise<void> {
        const file = Bun.file(path);
        await Bun.write(file, data);
    }

    async read(path: string): Promise<Record<string, unknown> | null> {
        const file = Bun.file(path);
        if (!file.exists()) {
            return null;
        }
        return await file.json();
    }
}
let storage: FileStorage | null = null;

export function getStorage(): FileStorage {
    if(!storage) {
        storage = new FileStorage();
    }
    return storage;
}
