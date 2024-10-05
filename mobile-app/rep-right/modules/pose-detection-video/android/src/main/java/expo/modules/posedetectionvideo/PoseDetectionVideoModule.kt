package expo.modules.posedetectionvideo

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.lang.Exception
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.pose.PoseDetection
import com.google.mlkit.vision.pose.PoseDetector;
import com.google.mlkit.vision.pose.PoseDetectorOptionsBase;
import kotlin.reflect.full.memberProperties;

class PoseDetectionVideoModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.

  // Base pose detector with streaming frames, when depending on the pose-detection sdk
//  val options = PoseDetectorOptions.Builder()
//          .setDetectorMode(PoseDetectorOptions.STREAM_MODE)
//          .build();
//  val options = PoseDetectorOptionsBase;
//  val poseDetector = PoseDetection.getClient(options);

  private class YourImageAnalyzer : ImageAnalysis.Analyzer {

    override fun analyze(imageProxy: ImageProxy) {
      val mediaImage = imageProxy.image
      if (mediaImage != null) {
        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
        // Pass image to an ML Kit Vision API
        // ...
      }
      imageProxy.close() // Don't forget to close the imageProxy to avoid memory leaks
    }
  }
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('PoseDetectionVideo')` in JavaScript.
    Name("PoseDetectionVideo")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

//    AsyncFunction("processVideoAsync") { uri: String ->
//      try {
//        val framesWithPositions = processVideoFrames(uri);
//
//        // Return the result by converting each frame's properties to a map using reflection
//        framesWithPositions.map { frame ->
//          frame.toMap() // This converts all properties of the frame to a map
//        }
//      } catch(e: Exception) {
//        promise.reject("ERROR", "Failed to process video: ${e.message}");
//      }
//    }
    AsyncFunction("processVideoAsync") { uri: String ->
      try {
        val framesWithPositions = processVideoFrames(uri);
        println(framesWithPositions)

        // Convert each frame to a map using reflection
//        val framesList = Arguments.createArray();
//        framesWithPositions.map { frame ->
//          //frame.toMap()
////          framesList.pushMap(frame.toWritableMap());
//        }
        val framesList = framesWithPositions.map { frame ->
          frame.toMap()
        }
        //promise.resolve(framesList);
        return@AsyncFunction framesList;
      } catch (e: Exception) {
        throw Exception("Failed to process video: ${e.message}")
      }
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(PoseDetectionVideoView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: PoseDetectionVideoView, prop: String ->
        println(prop)
      }
    }
  }

  fun Position.toMap(): Map<String, Double> {
    return mapOf("x" to this.x.toDouble(), "y" to this.y.toDouble())
  }

  fun FrameData.toMap(): Map<String, Any> {
    return mapOf(
            "frameNumber" to this.frameNumber,
            "leftElbow" to this.leftElbow.toMap(),
            "rightElbow" to this.rightElbow.toMap()
    )
  }

//    // Function to convert Position to WritableMap
//  fun Position.toWritableMap(): WritableMap {
//      val map = Arguments.createMap()
//      map.putDouble("x", this.x.toDouble())
//      map.putDouble("y", this.y.toDouble())
//      return map
//  }
//
//  // Function to convert FrameData to WritableMap
//  fun FrameData.toWritableMap(): WritableMap {
//      val map = Arguments.createMap()
//      map.putInt("frameNumber", this.frameNumber)
//      map.putMap("leftElbow", this.leftElbow.toWritableMap())
//      map.putMap("rightElbow", this.rightElbow.toWritableMap())
//      return map
//  }

  // Function to simulate video frame processing and elbow detection
  private fun processVideoFrames(videoUri: String): List<FrameData> { // 30 fps?
    // For simplicity, we're returning mock data
    return listOf(
            FrameData(1, Position(100, 200), Position(150, 200)),
            FrameData(2, Position(102, 202), Position(152, 202))
    )
  }

  // Data class representing frame data
  data class FrameData(val frameNumber: Int, val leftElbow: Position, val rightElbow: Position)

  // Data class representing an elbow's position
  data class Position(val x: Int, val y: Int)

//  // Extension function to convert any data class to a Map using Kotlin reflection
//  fun <T : Any> T.toMap(): Map<String, Any?> {
//    return this::class.memberProperties.associate { prop ->
//      prop.name to prop.get(this)
//    }
//  }

  fun <T : Any> T.toMap(): Map<String, Any?> {
    return this::class.memberProperties.associate { prop ->
      prop.name to prop.getter.call(this)
    }
  }
}
