//Started Reed Code
import AVFoundation
import MLKit

func getPosesFromVideo(filepath: String) -> [Pose] {
    guard let videoURL = URL(string: filepath) else {
        print("Invalid URL")
        return []
    }
    
    let asset = AVAsset(url: videoURL)
    let duration = asset.duration
    let durationSeconds = CMTimeGetSeconds(duration)
    
    // Base pose detector with streaming mode
    let options = PoseDetectorOptions()
    options.detectorMode = .stream
    
    // Create the instance of Pose Detector
    let poseDetector = PoseDetector.poseDetector(options: options)
    
    let imageGenerator = AVAssetImageGenerator(asset: asset)
    imageGenerator.appliesPreferredTrackTransform = true
    imageGenerator.requestedTimeToleranceBefore = .zero
    imageGenerator.requestedTimeToleranceAfter = .zero
    
    var poses: [Pose] = []
    let fps: Double = 30
    let frameDuration = 1.0 / fps
    
    for frameTime in stride(from: 0.0, to: durationSeconds, by: frameDuration) {
        let cmTime = CMTime(seconds: frameTime, preferredTimescale: 600)
        
        do {
            let cgImage = try imageGenerator.copyCGImage(at: cmTime, actualTime: nil)
            let image = UIImage(cgImage: cgImage)
            let visionImage = VisionImage(image: image)
            visionImage.orientation = image.imageOrientation
            
            let poseResults = try poseDetector.results(in: visionImage)
            
            if let pose = poseResults.first {
                poses.append(pose)
            }
        } catch {
            print("Error processing frame at \(frameTime) seconds: \(error.localizedDescription)")
        }
    }
    
    return poses
}

// Usage - TESTING
let videoFilepath = "https://example.com/path/to/your/video.mp4"  
let detectedPoses = getPosesFromVideo(filepath: videoFilepath)

print("Detected \(detectedPoses.count) poses in the video")
for (index, pose) in detectedPoses.enumerated() {
    print("Pose \(index + 1):")
    for landmark in pose.landmarks {
        print("  \(landmark.type): (\(landmark.position.x), \(landmark.position.y))")
    }
}