import cv2
import numpy as np
import pygame

pygame.mixer.init()
alarm_sound = pygame.mixer.Sound("alarm.wav")

playing = False

def play_alert_sound():
    global playing
    alarm_sound.play()
    playing = True


cam = cv2.VideoCapture(0)
ret, frame1 = cam.read()
frame1_gray = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
frame1_gray = cv2.GaussianBlur(frame1_gray, (21, 21), 0)

while True:
    ret, frame2 = cam.read()
    if not ret:
        break

    frame2_gray = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
    frame2_gray = cv2.GaussianBlur(frame2_gray, (21, 21), 0)

    diff = cv2.absdiff(frame1_gray, frame2_gray)
    thresh = cv2.threshold(diff, 15, 255, cv2.THRESH_BINARY)[1]
    thresh = cv2.dilate(thresh, None, iterations=2)

    contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    movement_det = False

    for contour in contours:
        if cv2.contourArea(contour) < 300:
            continue
        movement_det = True
        (x, y, w, h) = cv2.boundingRect(contour)
        cv2.rectangle(frame2, (x, y), (x + w, y + h), (0, 255, 0), 2)

    if movement_det:
        print(f"playing  = {playing}")
        if playing == False:
            print("playing sound")
            play_alert_sound()
        else:
            print("not playing sound")

    cv2.imshow("alarm camera", frame2)

    key = cv2.waitKey(30) & 0xFF
    if key == ord('q'):
        break
    if playing and not pygame.mixer.get_busy():
        playing = False

    frame1_gray = frame2_gray.copy()

cam.release()
cv2.destroyAllWindows()
