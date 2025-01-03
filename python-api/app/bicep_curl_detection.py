import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe modules
# Path to the video
######
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

# Rescale frame funct

# Functions
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

# Define BicepPoseAnalysis class
class BicepPoseAnalysis:
    def __init__(self, side, stage_down_threshold, stage_up_threshold, peak_contraction_threshold, loose_upper_arm_angle_threshold, visibility_threshold):
        self.side = side
        self.stage_down_threshold = stage_down_threshold
        self.stage_up_threshold = stage_up_threshold
        self.peak_contraction_threshold = peak_contraction_threshold
        self.loose_upper_arm_angle_threshold = loose_upper_arm_angle_threshold
        self.visibility_threshold = visibility_threshold
        self.counter = 0
        self.stage = "down"
        self.is_visible = True
        self.detected_errors = {"LOOSE_UPPER_ARM": 0, "PEAK_CONTRACTION": 0}
        self.loose_upper_arm = False
        self.peak_contraction_angle = 1000
        self.peak_contraction_frame = None
        self.rep = {}

    def get_joints(self, landmarks):
        side = self.side.upper()
        joints_visibility = [
            landmarks[mp_pose.PoseLandmark[f"{side}_SHOULDER"].value].visibility,
            landmarks[mp_pose.PoseLandmark[f"{side}_ELBOW"].value].visibility,
            landmarks[mp_pose.PoseLandmark[f"{side}_WRIST"].value].visibility
        ]
        self.is_visible = all(vis > self.visibility_threshold for vis in joints_visibility)
        if not self.is_visible:
            return False
        self.shoulder = [
            landmarks[mp_pose.PoseLandmark[f"{side}_SHOULDER"].value].x,
            landmarks[mp_pose.PoseLandmark[f"{side}_SHOULDER"].value].y,
        ]
        self.elbow = [
            landmarks[mp_pose.PoseLandmark[f"{side}_ELBOW"].value].x,
            landmarks[mp_pose.PoseLandmark[f"{side}_ELBOW"].value].y,
        ]
        self.wrist = [
            landmarks[mp_pose.PoseLandmark[f"{side}_WRIST"].value].x,
            landmarks[mp_pose.PoseLandmark[f"{side}_WRIST"].value].y,
        ]
        return True

    def analyze_pose(self, landmarks, frame, timestamp):
        if not self.get_joints(landmarks):
            return None, None

        bicep_curl_angle = int(calculate_angle(self.shoulder, self.elbow, self.wrist))
        if bicep_curl_angle > self.stage_down_threshold:
            self.stage = "down"
        elif bicep_curl_angle < self.stage_up_threshold and self.stage == "down":
            self.stage = "up"
            self.counter += 1
            self.rep[self.counter] = {"starting_time": timestamp, "ending_time": None, "errors": []}

        shoulder_projection = [self.shoulder[0], 1]
        ground_upper_arm_angle = int(calculate_angle(self.elbow, self.shoulder, shoulder_projection))

        if ground_upper_arm_angle > self.loose_upper_arm_angle_threshold:
            if not self.loose_upper_arm:
                self.loose_upper_arm = True
                self.detected_errors["LOOSE_UPPER_ARM"] += 1
                if self.counter in self.rep:
                    self.rep[self.counter]["errors"].append("Loose Upper Arm")
        else:
            self.loose_upper_arm = False

        if self.stage == "up" and bicep_curl_angle < self.peak_contraction_angle:
            self.peak_contraction_angle = bicep_curl_angle
            self.peak_contraction_frame = frame
        elif self.stage == "down":
            if self.peak_contraction_angle != 1000 and self.peak_contraction_angle >= self.peak_contraction_threshold:
                self.detected_errors["PEAK_CONTRACTION"] += 1
                if self.counter in self.rep:
                    self.rep[self.counter]["errors"].append("Peak Contraction Error")
            self.peak_contraction_angle = 1000
            self.peak_contraction_frame = None

        # Update ending time
        if self.counter in self.rep:
            self.rep[self.counter]["ending_time"] = timestamp

        return bicep_curl_angle, ground_upper_arm_angle

# Parameters
