import * as vscode from 'vscode';
import * as path from 'path';
import { ProcessManagerImpl } from './processManager';
import { CHARMONY_COMPILER_DIR, CHARMONY_JSON_OUTPUT, CHARMONY_SCRIPT_PATH, GENERATED_FILES } from "./config";
import * as rimraf from "rimraf";
import * as fs from "fs";
import { IntermediateJson } from "./charmony/IntermediateJson";
import CharmonyPanelController_v2 from "./outputPanel/PanelController_v2";
import * as commandExists from "command-exists";
import { runServerAnalysis } from './feature/runServerAnalysis';
import { escapePath } from './util/escapePath';

const processManager = ProcessManagerImpl.init();
const harmonyLangConfig = vscode.workspace.getConfiguration('harmonylang');
const hlConsole = vscode.window.createOutputChannel("HarmonyLang");
const pythonPath = harmonyLangConfig.get('pythonPath');
const ccPath = harmonyLangConfig.get('ccPath');

export const activate = (context: vscode.ExtensionContext) => {
    const runHarmonyCommand = vscode.commands.registerCommand('harmonylang.run', () => {
        const filename = vscode.window.activeTextEditor?.document?.fileName;
        const ext = path.extname(filename || '');
        const harmonyExt = [".hny", ".sab"];
        if (!harmonyExt.includes(ext)) {
            vscode.window.showInformationMessage('Target file must be an Harmony (.hny) file.');
            return;
        }
        if (filename == null) {
            vscode.window.showInformationMessage('Could not locate target file.');
            return;
        }
        runHarmony(context, filename);
    });

    const runHarmonyServerCommand = vscode.commands.registerCommand('harmonylang-server.run', () => {
        const filename = vscode.window.activeTextEditor?.document?.fileName;
        const ext = path.extname(filename || '');
        const harmonyExt = [".hny", ".sab"];
        if (!harmonyExt.includes(ext)) {
            vscode.window.showInformationMessage('Target file must be an Harmony (.hny) file.');
            return;
        }
        if (filename == null) {
            vscode.window.showInformationMessage('Could not locate target file.');
            return;
        }
        runHarmonyServer(context, filename);
    });

    const endHarmonyProcessesCommand = vscode.commands.registerCommand('harmonylang.end', () => {
        endHarmonyProcesses();
    });

    context.subscriptions.push(runHarmonyCommand);
    context.subscriptions.push(runHarmonyServerCommand);
    context.subscriptions.push(endHarmonyProcessesCommand);
};

export function endHarmonyProcesses() {
    showMessage('Ending all Harmony processes...');
    processManager.endAll();
    showMessage('All Harmony processes have ended.');
}

const showVscodeMessage = (isError: boolean, main: string, subHeader?: string, subtext?: string) => {
    const show = isError ? vscode.window.showErrorMessage : vscode.window.showInformationMessage;
    if (subHeader == null || subtext == null) {
        show(main);
    } else {
        show(main + (subtext.length > 0 ? `\n${subHeader}: ${subtext}` : ''));
    }
};

function checkIfPython3Exists(
    ifItExists: () => void,
    otherwise: () => void,
) {
    const command = (pythonPath) ? pythonPath as string : "python3";
    commandExists(command, (err, exists) => {
        if (exists) ifItExists();
        else otherwise();
    });
}

/**
 * Based on the following answer:
 * Source: https://stackoverflow.com/questions/34953168/node-check-existence-of-command-in-path
 */
function checkIfCompilerForCExists(
    ifItExists: () => void,
    otherwise: () => void,
): void {
    const command = (ccPath) ? ccPath as string : "cc";
    commandExists(command, (err, exists) => {
        if (exists) ifItExists();
        else otherwise();
    });
}

const showMessage = (main: string, subHeader?: string, subtext?: string) => {
    return showVscodeMessage(false, main, subHeader, subtext);
};

function onReceivingIntermediateJSON(results: IntermediateJson) {
    if (results != null && results.issue != null && results.issue != "No issues") {
        CharmonyPanelController_v2.currentPanel?.updateResults(results);
    } else {
        CharmonyPanelController_v2.currentPanel?.updateMessage(`No Errors Found.`);
    }
}

function runHarmonyServer(context: vscode.ExtensionContext, fullFileName: string) {
    CharmonyPanelController_v2.currentPanel?.dispose();
    CharmonyPanelController_v2.createOrShow(context.extensionUri);
    const workspace = vscode.workspace.workspaceFolders;
    if (workspace == null || workspace[0] == null) {
        return showVscodeMessage(true, "Cannot find current project workspace");
    }
    const rootDirectory = workspace[0].uri.fsPath;
    CharmonyPanelController_v2.currentPanel?.startLoading();
    runServerAnalysis(rootDirectory, fullFileName, onReceivingIntermediateJSON, 
        msg => {
            console.log(msg);
            CharmonyPanelController_v2.currentPanel?.updateMessage(msg);
        }
    );
}

export function runHarmony(context: vscode.ExtensionContext, fullFileName: string) {
    CharmonyPanelController_v2.currentPanel?.dispose();
    CharmonyPanelController_v2.createOrShow(context.extensionUri);
    checkIfPython3Exists(() => {
        hlConsole.appendLine("Check for Python3");
        checkIfCompilerForCExists(() => {
            hlConsole.appendLine("Check for CC");
            const osAlias = (process.platform === "win32") ? "doskey" : "alias";
            let charmonyCompileCommand = "";
            if (typeof pythonPath === "string" && pythonPath != "python3") { charmonyCompileCommand += `${osAlias} python3=${escapePath(pythonPath)} & `; }
            if (typeof ccPath === "string" && ccPath != "cc") { charmonyCompileCommand += `${osAlias} cc=${escapePath(ccPath)} & `; }
            charmonyCompileCommand += `${CHARMONY_SCRIPT_PATH} ${escapePath(fullFileName)}`;
            console.log(charmonyCompileCommand);
            processManager.startCommand(charmonyCompileCommand, {
                cwd: CHARMONY_COMPILER_DIR
            }, (error, stdout, stderr) => {
                if (processManager.processesAreKilled) return;
                CharmonyPanelController_v2.currentPanel?.startLoading();
                hlConsole.clear();
                if (stderr) {
                    hlConsole.appendLine(stderr);
                    hlConsole.append(error?.message ?? "");
                    hlConsole.append(stdout);
                    CharmonyPanelController_v2.currentPanel?.updateMessage(`See Output Panel for details.`);
                    hlConsole.show();
                    return;
                }
                hlConsole.appendLine(stdout);
                if (error) {
                    return CharmonyPanelController_v2.currentPanel?.updateMessage(stdout);
                }
                try {
                    const results: IntermediateJson = JSON.parse(fs.readFileSync(CHARMONY_JSON_OUTPUT, {
                        encoding: 'utf-8'
                    }));
                    onReceivingIntermediateJSON(results);
                    GENERATED_FILES.forEach(f => rimraf.sync(f));
                } catch (error) {
                    hlConsole.appendLine(error);
                    hlConsole.show();    
                    CharmonyPanelController_v2.currentPanel?.updateMessage(`Could not create analysis file.`);
                }
            });
        }, () => {
            showVscodeMessage(true,
                "Missing dependency",
                "Target for cc C-compiler cannot be found. Attempting to run server compiler",
                "The model checker requires a C-compiler. Please check you have a C-compiler before continuing."
            );
            runHarmonyServer(context, fullFileName);
        });
    }, () => {
        showVscodeMessage(true,
            "Missing dependency",
            "Target for python3 cannot be found. Attempting to run server compiler",
            "The model checker requires Python3. Please install Python3 and to run compiler locally.");
        runHarmonyServer(context, fullFileName);
    });
}
