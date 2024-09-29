import * as React from 'react';

import { PoseDetectionVideoViewProps } from './PoseDetectionVideo.types';

export default function PoseDetectionVideoView(props: PoseDetectionVideoViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
