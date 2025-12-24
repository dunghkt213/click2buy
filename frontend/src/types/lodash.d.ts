declare module 'lodash' {
    export type DebouncedFunc<T extends (...args: any[]) => any> = T & {
        cancel: () => void;
        flush: () => ReturnType<T>;
    };

    const lodash: any;
    export default lodash;
}
