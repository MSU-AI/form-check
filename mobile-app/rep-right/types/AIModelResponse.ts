export type TimeFormat = `${number}${number}:${number}${number}.${number}${number}${number}`;

export interface RepFromAIModel {
    time: `${TimeFormat}-${TimeFormat}`;
    [errorName: string]: [boolean, TimeFormat | null] | string; // The | string is only for time, however there is no elegant way to only enforce it for time
}

export type FramesFromAIModel = RepFromAIModel[];


/* Sample:
[{
    'time':0:00.00-0:10.272,
    'error1':[true,time stamp for where the error is if it is there or null]}
    ] - set video player for the rep view to that error time
*/
/*
{
    errors: ['swinging', 'elbowMovement'],
    frames: [
        {
            'time':0:00.00-0:10.272,
            'swinging':[time stamp for where the error is if it is there or null if can't find one (maybe not needed)]} // only errors that are observed are defined
        }
    ]
}
*/
