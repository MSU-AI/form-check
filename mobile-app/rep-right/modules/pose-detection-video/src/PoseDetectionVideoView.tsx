import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { PoseDetectionVideoViewProps } from './PoseDetectionVideo.types';

const NativeView: React.ComponentType<PoseDetectionVideoViewProps> =
  requireNativeViewManager('PoseDetectionVideo');

export default function PoseDetectionVideoView(props: PoseDetectionVideoViewProps) {
  return <NativeView {...props} />;
}
