import android.graphics.Bitmap
import android.util.Log
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.pose.Pose
import com.google.mlkit.vision.pose.PoseDetection
import com.google.mlkit.vision.pose.PoseDetector
import com.google.mlkit.vision.pose.PoseDetectorOptionsBase
//import com.google.mlkit.vision.pose.PoseDetectorOptions
import com.google.mlkit.vision.pose.PoseLandmark
import kotlinx.coroutines.tasks.await



//import com.google.mlkit.vision.objects.ObjectDetectorOptionsBase.DetectorMode;
//import com.google.mlkit.vision.objects.custom.CustomObjectDetectorOptions;
//import com.google.mlkit.vision.objects.defaults.ObjectDetectorOptions;
import com.google.mlkit.vision.pose.accurate.AccuratePoseDetectorOptions;
import com.google.mlkit.vision.pose.defaults.PoseDetectorOptions;

class PoseDetectorProcessor {
    private val poseDetector: PoseDetector

//    fun getPoseDetectorOptionsForLivePreview(context: Context?): PoseDetectorOptionsBase? {
//        val performanceMode: Int = getModeTypePreferenceValue(
//                context,
//                R.string.pref_key_live_preview_pose_detection_performance_mode,
//                POSE_DETECTOR_PERFORMANCE_MODE_FAST)
//        val preferGPU: Boolean = preferGPUForPoseDetection(context)
//        return if (performanceMode == POSE_DETECTOR_PERFORMANCE_MODE_FAST) {
//            val builder: PoseDetectorOptions.Builder = Builder().setDetectorMode(PoseDetectorOptions.STREAM_MODE)
//            if (preferGPU) {
//                builder.setPreferredHardwareConfigs(PoseDetectorOptions.CPU_GPU)
//            }
//            builder.build()
//        } else {
//            val builder: AccuratePoseDetectorOptions.Builder = Builder()
//                    .setDetectorMode(AccuratePoseDetectorOptions.STREAM_MODE)
//            if (preferGPU) {
//                builder.setPreferredHardwareConfigs(AccuratePoseDetectorOptions.CPU_GPU)
//            }
//            builder.build()
//        }
//    }

    init {
        // Base pose detector with streaming frames, when depending on the pose-detection sdk
        //val options = PoseDetectorOptions.Builder()
        //    .setDetectorMode(PoseDetectorOptions.STREAM_MODE)
        //    .build()
//        val options = getPoseDetectorOptionsForLivePreview(this)
        val builder: PoseDetectorOptions.Builder = PoseDetectorOptions.Builder().setDetectorMode(PoseDetectorOptions.STREAM_MODE)
        val options = builder.build();
        //val options = com.google.mlkit.vision.pose.PoseDetectorOptions.Builder()
        //    .setDetectorMode(com.google.mlkit.vision.pose.PoseDetectorOptions.STREAM_MODE)
        //    .build()

        poseDetector = PoseDetection.getClient(options)
    }


//    fun processFrame(bitmap: Bitmap?) {
//        if (bitmap == null){
//            return;
//        }
//        val image: InputImage = InputImage.fromBitmap(bitmap, 0) // Assuming no rotation
//        poseDetector.process(image)
//                .addOnSuccessListener { pose: Pose -> processPose(pose) }
//                .addOnFailureListener { e -> Log.e("PoseDetection", "Pose detection failed", e) }
//    }
    suspend fun processFrame(bitmap: Bitmap): Pose? {
        val inputImage = InputImage.fromBitmap(bitmap, 0)  // Assuming no rotation

        // Process the image asynchronously and return the Pose
        return try {
            val pose = poseDetector.process(inputImage).await()  // Use await to handle Task
            
            // Somewhere in your pose processing function
            val landmarks = pose.getAllPoseLandmarks()

            if (landmarks.isNotEmpty()) {
                // Convert the list of landmarks to a readable string
                val landmarksString = landmarks.joinToString(separator = "\n") { landmark ->
                    "Landmark: ${landmark.landmarkType}, Position: (${landmark.position.x}, ${landmark.position.y})"
                }
                
                // Log the landmarks
                Log.d("PoseDetection", landmarksString)
            } else {
                Log.d("PoseDetection", "No landmarks detected")
            }

            pose
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun processPose(pose: Pose) {
        // Handle pose landmarks (e.g., left elbow, right elbow, etc.)
        // This can include drawing the pose on a canvas or logging the landmarks
        // For example:
        if (pose == null){
            return;
        }
        val leftElbow: PoseLandmark? = pose.getPoseLandmark(PoseLandmark.LEFT_ELBOW)
        if (leftElbow == null) {
            return;
        }
        if (leftElbow != null) {
            Log.d("PoseDetection", "Left elbow position: " + leftElbow.getPosition())
        }
    }

    fun stop() {
        poseDetector.close()
    }
}
