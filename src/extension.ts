import * as vscode from 'vscode';
import * as path from 'path';
import { IntermediateJson } from "./charmony/IntermediateJson";
import CharmonyPanelController_v2 from "./outputPanel/PanelController_v2";
import { runServerAnalysis } from './feature/runServerAnalysis';

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
        runHarmonyServer(context, filename);
    });
    context.subscriptions.push(runHarmonyCommand);
};

const showVscodeMessage = (isError: boolean, main: string, subHeader?: string, subtext?: string) => {
    const show = isError ? vscode.window.showErrorMessage : vscode.window.showInformationMessage;
    if (subHeader == null || subtext == null) {
        show(main);
    } else {
        show(main + (subtext.length > 0 ? `\n${subHeader}: ${subtext}` : ''));
    }
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
