import cv2
import mediapipe as mp
import math
import os

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


def process_video(video_path, output_path):
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
    
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  
    while cap.isOpened():
        ret, frame = cap.read()
        if ret:
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
           
            results = pose.process(image)
            
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            mp.solutions.drawing_utils.draw_landmarks(
                image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
            
            
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                form_feedback = detect_bicep_curl_form(landmarks, initial_elbow_position)
                
                
                cv2.putText(image, form_feedback, (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            
           
            out.write(image)
        else:
            break
    
    cap.release()
    out.release()
    print(f"Processed video saved to {output_path}")


if __name__ == "__main__":
    video_path = 'b1_bicepcurl_1.mp4'  
    output_path = 'output_video.mp4'   

    process_video(video_path, output_path)
