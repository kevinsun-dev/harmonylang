
export function escapePath(pathname: string): string {
    return JSON.stringify(pathname);
    // return pathname.replace(/(\s+)/g, '\\ ');
}