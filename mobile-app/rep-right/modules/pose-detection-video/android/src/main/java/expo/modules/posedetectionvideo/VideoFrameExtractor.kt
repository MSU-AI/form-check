import android.media.MediaMetadataRetriever
import android.graphics.Bitmap
import android.net.Uri
import android.util.Log
import android.content.Context
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import PoseDetectorProcessor

class InvalidVideoException(message: String) : Exception(message)
class VideoFrameExtractor {
    companion object {
        // Method to extract frames from a video URI and process them asynchronously
        suspend fun extractAndProcessFrames(
                context: Context?,
                videoUri: Uri?,
                onFrameExtracted: (Bitmap) -> Unit
        ) {
            // Run frame extraction on a background thread (IO Dispatcher)
            withContext(Dispatchers.IO) {
                val retriever = MediaMetadataRetriever()
                Log.d("PoseDetection", "Frame extraction started")

                try {
                    // Set the data source to the video URI
                    retriever.setDataSource(context, videoUri)

                    // Get video duration
                    val timeFromRetriever: String? = retriever.extractMetadata(
                            MediaMetadataRetriever.METADATA_KEY_DURATION
                    )
                    val durationMs = timeFromRetriever?.toLong()?.times(1000)
                            ?: throw InvalidVideoException("Unable to extract video duration.")

                    // Extract frames from video at intervals
                    var timestamp: Long = 0
                    val frameInterval: Long = 100_000 // 100ms interval

                    while (timestamp < durationMs) {
                        // Extract the frame at the current timestamp
                        val frame: Bitmap? = retriever.getFrameAtTime(
                                timestamp,
                                MediaMetadataRetriever.OPTION_CLOSEST
                        )
                        Log.d("PoseDetection", "Frame extracted")


                        // If the frame is not null, pass it to the callback for further processing
                        frame?.let {
                            onFrameExtracted(it)
                        }
                        timestamp += frameInterval // Increment timestamp by 100ms
                    }
                } finally {
                    // Release the retriever resources when done
                    retriever.release()
                }
            }
        }
    }
}
