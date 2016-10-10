const tmp = require('tmp');

export function isNotInstalledError(error: Error): boolean {
    return typeof (error) === 'object' && error !== null && ((<any>error).code === 'ENOENT' || (<any>error).code === 127);
}

export interface Deferred<T> {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    promise: Promise<T>;
}

export function createDeferred<T>(): Deferred<T> {
    let resolve: (value?: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;

    let promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return {
        resolve, reject, promise
    };
}

export function createTemporaryFile(extension: string, temporaryDirectory?: string): Promise<{ filePath: string, cleanupCallback: Function }> {
    let options: any = { postfix: extension };
    if (temporaryDirectory) {
        options.dir = temporaryDirectory;
    }

    return new Promise<{ filePath: string, cleanupCallback: Function }>((resolve, reject) => {
        tmp.file(options, function _tempFileCreated(err, tmpFile, fd, cleanupCallback) {
            if (err) {
                return reject(err);
            }
            resolve({ filePath: tmpFile, cleanupCallback: cleanupCallback });
        });
    });
}

export function utf8Decode(utf8String: string) {
    if (utf8String.length === 0) {
        return "";
    }
    // if (utf8String.startsWith("A")) {
    //     return utf8String.substring(1);
    // }
    // utf8String = utf8String.substring(1);

    if (typeof utf8String != 'string') throw new TypeError('parameter ‘utf8String’ is not a string');
    // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
    const unicodeString = utf8String.replace(
        /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
        function (c) {  // (note parentheses for precedence)
            var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
            return String.fromCharCode(cc);
        }
    ).replace(
        /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
        function (c) {  // (note parentheses for precedence)
            var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
            return String.fromCharCode(cc);
        }
        );
    return unicodeString;
}