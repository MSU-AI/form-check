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
from bicep_curl_detection import BicepPoseAnalysis
app = FastAPI()
# config = {
#     **dotenv_values(".env"), 
# }

# origins = [config["FRONTEND_URL"]] # temporarily allowing everything
origins = ["*"]
print(origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load_dotenv()
# cred = credentials.Certificate("/app/service-account.json")
cred = credentials.Certificate("./service-account.json")
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

    # Determine important landmarks for plank
    IMPORTANT_LMS = [
        "NOSE",
        "LEFT_SHOULDER",
        "RIGHT_SHOULDER",
        "RIGHT_ELBOW",
        "LEFT_ELBOW",
        "RIGHT_WRIST",
        "LEFT_WRIST",
        "LEFT_HIP",
        "RIGHT_HIP",
    ]

    # Generate all columns of the data frame

    HEADERS = ["label"] # Label column

    for lm in IMPORTANT_LMS:
        HEADERS += [f"{lm.lower()}_x", f"{lm.lower()}_y", f"{lm.lower()}_z", f"{lm.lower()}_v"]
    
    def rescale_frame(frame, percent=50):
        '''
        Rescale a frame from OpenCV to a certain percentage compare to its original frame
        '''
        width = int(frame.shape[1] * percent/ 100)
        height = int(frame.shape[0] * percent/ 100)
        dim = (width, height)
        return cv2.resize(frame, dim, interpolation =cv2.INTER_AREA)


    def save_frame_as_image(frame, message: str = None):
        '''
        Save a frame as image to display the error
        '''
        now = datetime.datetime.now()

        if message:
            cv2.putText(frame, message, (50, 150), cv2.FONT_HERSHEY_COMPLEX, 0.4, (0, 0, 0), 1, cv2.LINE_AA)

        print("Saving ...")
        cv2.imwrite(f"../data/logs/bicep_{now}.jpg", frame)


    def calculate_angle(point1: list, point2: list, point3: list) -> float:
        '''
        Calculate the angle between 3 points
        Unit of the angle will be in Degree
        '''
        point1 = np.array(point1)
        point2 = np.array(point2)
        point3 = np.array(point3)

        # Calculate algo
        angleInRad = np.arctan2(point3[1] - point2[1], point3[0] - point2[0]) - np.arctan2(point1[1] - point2[1], point1[0] - point2[0])
        angleInDeg = np.abs(angleInRad * 180.0 / np.pi)

        angleInDeg = angleInDeg if angleInDeg <= 180 else 360 - angleInDeg
        return angleInDeg


    def extract_important_keypoints(results, important_landmarks: list) -> list:
        '''
        Extract important keypoints from mediapipe pose detection
        '''
        landmarks = results.pose_landmarks.landmark

        data = []
        for lm in important_landmarks:
            keypoint = landmarks[mp_pose.PoseLandmark[lm].value]
            data.append([keypoint.x, keypoint.y, keypoint.z, keypoint.visibility])

        return np.array(data).flatten().tolist()
    VISIBILITY_THRESHOLD = 0.65
    STAGE_UP_THRESHOLD = 90
    STAGE_DOWN_THRESHOLD = 120
    PEAK_CONTRACTION_THRESHOLD = 60
    LOOSE_UPPER_ARM_ANGLE_THRESHOLD = 40

    # Initialize analysis classes for left and right arms
    left_arm_analysis = BicepPoseAnalysis("left", STAGE_DOWN_THRESHOLD, STAGE_UP_THRESHOLD, PEAK_CONTRACTION_THRESHOLD, LOOSE_UPPER_ARM_ANGLE_THRESHOLD, VISIBILITY_THRESHOLD)
    right_arm_analysis = BicepPoseAnalysis("right", STAGE_DOWN_THRESHOLD, STAGE_UP_THRESHOLD, PEAK_CONTRACTION_THRESHOLD, LOOSE_UPPER_ARM_ANGLE_THRESHOLD, VISIBILITY_THRESHOLD)

    # Global dictionaries for both arms
    video_reps_left = {}
    video_reps_right = {}

    frame_number = 0
    cap = cv2.VideoCapture(videoName)
    fps = cap.get(cv2.CAP_PROP_FPS)

    with mp_pose.Pose(min_detection_confidence=0.8, min_tracking_confidence=0.8) as pose:
        while cap.isOpened():
            ret, image = cap.read()
            if not ret:
                break

        cap.release()
        #out.release()
        #print(f"Processed video saved to {output_path}")
        new_output_dict={}
        counter=1
        if len(form_output_dict)>0:
            for key,value in form_output_dict.items():
                if form_output_dict[key]['starting']!=form_output_dict[key]['ending']:
                    new_output_dict[counter]={'starting':form_output_dict[key]['starting'],'ending':form_output_dict[key]['ending'],'bad_rep':form_output_dict[key]['bad_rep']}
                    counter+=1
        if full_range_of_motion==False:
            new_output_dict[counter]={'starting':0.0,'ending':timestamp,'bad_rep':True}
        return new_output_dict

    output1=process_video1(videoName)
    os.remove(videoName)
    return output1
    # send bearer and name to firebase
