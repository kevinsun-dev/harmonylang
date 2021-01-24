import {getHtmlContent} from "./analysis";
import {IntermediateJson} from "./IntermediateJson";

/**
 * Parses an intermediate JSON file into a HarmonyTopLevel object.
 * @param decodedJson
 */
export const parse = (decodedJson: IntermediateJson): HarmonyTopLevel => {
    return getHtmlContent(decodedJson);
};

export type HarmonyTopLevel = {
    path_to_bad_node: ProcessPathDetail;
    executed_code: HarmonyCode[];
};

export type HarmonyCode = {
    assembly: HarmonyAssembly[];
    file: string;
    line: string;
    source_code: string;
    start_pc: number;
};

export type HarmonyAssembly = {
    code: string;
    explain: string;
};

export type ProcessPathDetail = {
    issue: string;
    processes: HarmonyProcess[];
    pid_to_name: Record<string, string>;
};

export type HarmonyProcess = {
    pid: string;
    name: string;
    slices: HarmonySlice[];
    duration: number;
    steps: HarmonyStep[];
}

export type HarmonySlice = {
    duration: number;
    shared_values: Record<string, unknown>;
    trace: Record<string, TraceData>;
    mode: string;
    failure?: string;
};

export type HarmonyStep = {
    choose?: [number, unknown];
    step?: [number, number];
}

export type HarmonyContext = {
    pid: string;
    process_name: string;
    failure?: string;
    mode: string;
    traces: HarmonyTrace[];
};

export type TraceData = {
    mode: string;
    failure: string | undefined;
    traces: HarmonyTrace[]
};

export type HarmonyTrace = {
    vars: Record<string, unknown>;
    method: string;
    pc: string;
    calltype: string;
};
