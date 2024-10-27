from typing import Annotated, Optional
from fastapi import Depends, FastAPI, Query, status, HTTPException
from dotenv import load_dotenv, dotenv_values
import firebase_admin
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import auth, storage, credentials
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import cv2
import mediapipe as mp
import math

app = FastAPI()
config = {
    **dotenv_values(".env"), 
}

origins = [config["FRONTEND_URL"]] # temporarily allowing everything
print(origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load_dotenv()
cred = credentials.Certificate('./service-account.json')
default_app = firebase_admin.initialize_app(cred, {
        'storageBucket': 'form-checker-7535c.appspot.com'
})

bucket = storage.bucket()


# https://medium.com/@gabriel.cournelle/firebase-authentication-in-the-backend-with-fastapi-4ff3d5db55ca

# use of a simple bearer scheme as auth is handled by firebase and not fastapi
# we set auto_error to False because fastapi incorrectly returns a 403 intead 
# of a 401
# see: https://github.com/tiangolo/fastapi/pull/2120
bearer_scheme = HTTPBearer(auto_error=False)

# https://medium.com/@gabriel.cournelle/firebase-authentication-in-the-backend-with-fastapi-4ff3d5db55ca
def get_firebase_user_from_token(
    token: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)],
) -> Optional[dict]:
    """Uses bearer token to identify firebase user id

    Args:
        token : the bearer token. Can be None as we set auto_error to False

    Returns:
        dict: the firebase user on success
    Raises:
        HTTPException 401 if user does not exist or token is invalid
    """
    try:
        if not token:
            # raise and catch to return 401, only needed because fastapi returns 403
            # by default instead of 401 so we set auto_error to False
            raise ValueError("No token")
        user = auth.verify_id_token(token.credentials)
        return user

    # lots of possible exceptions, see firebase_admin.auth,
    # but most of the time it is a credentials issue
    except Exception:
        # see https://fastapi.tiangolo.com/tutorial/security/simple-oauth2/
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not logged in or Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/process_video")
async def process_video(user: Annotated[dict, Depends(get_firebase_user_from_token)],
                        videoName: Annotated[str,Query()]):
    # print(user['uid'])

    blob = bucket.blob(f"videos/{user['uid']}/{videoName}") #.upload_from_string("dummy")
    print(blob.public_url)
    print(blob.size)
    print(user['uid'])
    try:
        blob.download_to_filename(videoName)
    except Exception as e:
        try: # added in case the file was not found
            os.remove(videoName)
        except:
            pass
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video not found on the account for this user",
            headers={"WWW-Authenticate": "Bearer"}
        )
    print(os.path.getsize(videoName))
    videoSize = os.path.getsize(videoName)
    ######
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose()

    def calculate_angle(a, b, c):
        a = [a.x, a.y]
        b = [b.x, b.y]
        c = [c.x, c.y]
        
        radians = math.atan2(c[1] - b[1], c[0] - b[0]) - math.atan2(a[1] - b[1], a[0] - b[0])
        angle = abs(radians * 180.0 / math.pi)
        
        if angle > 180.0:
            angle = 360 - angle
        
        return angle

    def detect_bicep_curl_form(landmarks, initial_elbow_position):
        shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
        wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]
        
        
        elbow_angle = calculate_angle(shoulder, elbow, wrist)
        
        elbow_movement_threshold = 0.05  
        current_elbow_position = (elbow.x, elbow.y)
        movement_distance = math.sqrt((current_elbow_position[0] - initial_elbow_position[0])**2 +
                                    (current_elbow_position[1] - initial_elbow_position[1])**2)
        
        if movement_distance > elbow_movement_threshold:
            return "Bad form: Elbow moved too much!"

        
        if elbow_angle < 40:  
            return "Curl completed: Good form!"
        elif elbow_angle > 160:  
            return "Curl started: Good form!"
        else:
            return "Curl on-going"


    def process_video1(video_path, output_path):
        # print("here")
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            print("Error: Could not open video.")
            return
        
        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')  
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read the video.")
            return
        
        
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)
        
        
        if results.pose_landmarks:
            initial_elbow_position = (
                results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y
            )
        else:
            initial_elbow_position = (0, 0) 
        frame_number=0
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  
        form_output_dict={}
        while cap.isOpened():
            ret, frame = cap.read()
            if ret:
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                timestamp=frame_number/fps
                results = pose.process(image)
                
                image.flags.writeable = True
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                
                mp.solutions.drawing_utils.draw_landmarks(
                    image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
                
                
                if results.pose_landmarks:
                    landmarks = results.pose_landmarks.landmark
                    form_feedback = detect_bicep_curl_form(landmarks, initial_elbow_position)
                    form_output_dict[timestamp]=form_feedback
                
                    #cv2.putText(image, form_feedback, (10, 30), 
                                #cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                #out.write(image)
                frame_number+=1
            else:
                break
        
        cap.release()
        out.release()
        #print(f"Processed video saved to {output_path}")
        return form_output_dict

    output_path = 'output_video.mp4'  
    output_dict=process_video1(videoName, output_path)
    ######
    os.remove(videoName)

    return output_dict
    # send bearer and name to firebase
