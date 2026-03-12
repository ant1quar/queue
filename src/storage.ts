//Тут изолировал логику работы с файлами.
//Название класса не совсем корректное, но Storage уже занят. Интерфейс универсальный - можно и в базу писать и в файлы и в REST.
//Сделал синглтон для того, так как обычно инициализация таких классов может быть тяжелой операцией.

export class FileStorage {
    async write(path: string, data: string): Promise<void> {
        const file = Bun.file(path);
        await Bun.write(file, data);
    }

    async read(path: string): Promise<Record<string, unknown> | null> {
        const file = Bun.file(path);
        if (!(await file.exists())) {
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
