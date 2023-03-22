import { useUneeq } from "./context/UneeqProvider";
import { Box, Button } from "rebass";
import Webcam from "react-webcam";
import { CameraOptions, useFaceDetection } from "./context/CamProvider";
import FaceDetection from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import { useSpeechRecognition } from "react-speech-recognition";
import VideoControls from "./components/VideoControls";
import { useCall } from "./context/CallProvider";

const WebcamDemo = (): JSX.Element => {
    const { webcamRef } = useFaceDetection({
        faceDetectionOptions: {
            model: "short",
        },
        faceDetection: new FaceDetection.FaceDetection({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
        }),
        camera: ({ mediaSrc, onFrame, width, height }: CameraOptions) =>
            new Camera(mediaSrc, {
                onFrame,
                width,
                height,
            }),
    });

    return (
        <div>
            <Webcam
                ref={webcamRef}
                forceScreenshotSourceSize
                style={{
                    height: "100%",
                    width: "100%",
                    // objectFit: 'cover',
                    position: "absolute",
                }}
            />
        </div>
    );
};

function DigitalHuman() {
    const { setAvatarVideoContainer, setLocalVideoContainer } = useUneeq();
    const { browserSupportsSpeechRecognition } = useSpeechRecognition();
    
    const { isVideoMode} = useCall();

    return (
        <>
            {browserSupportsSpeechRecognition && isVideoMode ? (
                <>
                    <Box
                        style={{ height: "100vh", background: "black" }}
                        ref={(ref) => setAvatarVideoContainer(ref)}
                    />
                    <Box style={{ display: "none" }} ref={(ref) => setLocalVideoContainer(ref)} />
                    {/* <WebcamDemo /> */}
                    
                    <VideoControls />
                    
                </>
            ) : null}
        </>
    );
}

export default DigitalHuman;
