import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as rm from "rimraf";

const compilerPath = path.join(__dirname, "..", "..", "harmony-0.9");
const homeDir = os.homedir();
const harmonyPath = path.join(homeDir, "cs4410_harmony");

/**
 * Adds the Harmony compiler locally into the user's computer.
 */
export function install(
  onSuccess: () => void,
  onFail: () => void,
  alreadyAdded: () => void
): void {
  if (fs.existsSync(harmonyPath)) {
    return alreadyAdded && alreadyAdded();
  }
  const directories = [compilerPath];
  if (!fs.existsSync(harmonyPath)) {
    fs.mkdirSync(harmonyPath);
    while (directories.length > 0) {
      const dir = directories.pop() as string;
      fs.readdirSync(dir).forEach((file) => {
        const src = path.join(dir, file);
        const subpath = path.relative(compilerPath, dir);
        if (fs.lstatSync(src).isDirectory()) {
          fs.mkdirSync(path.join(harmonyPath, subpath, file));
          directories.push(src);
        } else {
          const dest = path.join(harmonyPath, subpath, file);
          fs.copyFileSync(src, dest);
        }
      });
    }
    if (process.env.SHELL === "/bin/zsh") {
      fs.appendFileSync(
        path.join(os.homedir(), ".zshrc"),
        `\nexport PATH=${harmonyPath}:$PATH\n`
      );
      return onSuccess();
    }
  }
  return onFail();
}

/**
 * Removes the compiler from the user's computer if it exists.
 */
export function uninstall(
  onSuccess: () => void,
  onFail: () => void,
  alreadyRemoved: () => void
): void {
  if (!fs.existsSync(harmonyPath)) {
    return alreadyRemoved && alreadyRemoved();
  }
  if (fs.existsSync(harmonyPath)) {
    rm.sync(harmonyPath);
    return onSuccess();
  }
  return onFail();
}