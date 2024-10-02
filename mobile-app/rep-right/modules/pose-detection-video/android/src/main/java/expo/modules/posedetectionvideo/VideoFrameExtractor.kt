import android.media.MediaMetadataRetriever
import android.graphics.Bitmap
import android.net.Uri
import android.content.Context
import com.google.mlkit.vision.common.InputImage

class VideoFrameExtractor {
    companion object {
        // Method to extract InputImage objects from a video URI
        fun extractInputImagesFromVideo(context: Context?, videoUri: Uri?): List<InputImage> {
            val retriever = MediaMetadataRetriever()
            retriever.setDataSource(context, videoUri)
            val inputImages: MutableList<InputImage> = java.util.ArrayList<InputImage>()
            val time: String = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
            val durationMs: Long = time.toLong() * 1000
            var i: Long = 0
            while (i < durationMs) {
                // 1-second interval
                val frame: Bitmap = retriever.getFrameAtTime(i, MediaMetadataRetriever.OPTION_CLOSEST)
                if (frame != null) {
                    val image: InputImage = InputImage.fromBitmap(frame, 0)
                    inputImages.add(image)
                }
                i += 1000000
            }
            retriever.release()
            return inputImages
        }
    }
}