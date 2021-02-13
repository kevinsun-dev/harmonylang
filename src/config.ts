import * as path from "path";

export const EXTENSION_DIR = path.join(__dirname, "..");
export const DEBUG_DIR = path.join(EXTENSION_DIR, "debug");
export const RESOURCE_DIR = path.join(EXTENSION_DIR, 'resource');
export const CHARMONY_HTML_FILE = path.join(RESOURCE_DIR, "charmony-v2.html");

export const HARMONY_SERVER_API = "https://harmonylang.herokuapp.com/";

export const HARMONY_REGISTER_API = "http://localhost:8080/register";
export const HARMONY_CHECK_API = (token: string) => `http://localhost:8080/check?token=${token}`;
