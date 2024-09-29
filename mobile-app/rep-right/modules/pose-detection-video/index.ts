import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to PoseDetectionVideo.web.ts
// and on native platforms to PoseDetectionVideo.ts
import PoseDetectionVideoModule from './src/PoseDetectionVideoModule';
import PoseDetectionVideoView from './src/PoseDetectionVideoView';
import { ChangeEventPayload, PoseDetectionVideoViewProps } from './src/PoseDetectionVideo.types';

// Get the native constant value.
export const PI = PoseDetectionVideoModule.PI;

export function hello(): string {
  return PoseDetectionVideoModule.hello();
}

export async function setValueAsync(value: string) {
  return await PoseDetectionVideoModule.setValueAsync(value);
}

const emitter = new EventEmitter(PoseDetectionVideoModule ?? NativeModulesProxy.PoseDetectionVideo);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { PoseDetectionVideoView, PoseDetectionVideoViewProps, ChangeEventPayload };
