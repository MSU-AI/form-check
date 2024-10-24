import { FramesFromAIModel } from "./types/AIModelResponse";

export const sampleData: FramesFromAIModel = [ // should probably just have {possibleErrors:string, DataArr} instead of defining everything
    {
        time: "00:00.000-00:10.272", // might need to make this a little less strict type checking
        swinging: [true, "00:10.232"],
        elbowMovement: [true, "00:09.221"]
    }, // representing each rep
    {
        time: "00:10.272-00:20.544",
        swinging: [true, "00:10.232"],
        elbowMovement: [true, "00:09.221"]
    },
    {
        time: "00:20.544-00:30.816",
        swinging: [true, "00:10.232"],
        elbowMovement: [true, "00:09.221"]
    }
]
