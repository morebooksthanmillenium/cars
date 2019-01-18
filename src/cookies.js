define(() => {
    const cookies = {
        internal: {}
    };

    cookies.Cookie = class {
        constructor(document) {
            this.document  = document;
        }

        read(key) {
            const pairHasNeededKey = pair => pair.key === key;
            const pairWithNeededKey = this.keyValuePairs().find(pairHasNeededKey);
            return pairWithNeededKey ? pairWithNeededKey.value : undefined;
        }

        keyValuePairs() {
            return this.document.cookie.split('; ').map(piece => {
                const [key, value] = piece.split('=');
                return {key, value};
            });
        }

        write(key, value) {
            this.document.cookie = `${key}=${value}`;
        }
    };

    return cookies;
});