import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Results } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import { FaceDetection, Options } from '@mediapipe/face_detection';
import { LegacyRef, RefObject } from 'react';

export interface IFaceDetectionReturnType {
  webcamRef: LegacyRef<Webcam>;
}

export type FaceDetectionResults = Results;

export type FaceDetectionOptions = Options;

export type CameraOptions = {
  mediaSrc: HTMLVideoElement;
  onFrame: () => Promise<void>;
  width: number;
  height: number;
};

export type ICamera = (cameraOptions: CameraOptions) => Camera;
export interface IFaceDetectionOptions {
  mirrored?: boolean;
//   handleOnResults?: (results: FaceDetectionResults) => void;
  faceDetectionOptions?: FaceDetectionOptions;
  faceDetection: FaceDetection;
  camera?: ICamera;
}

export const useFaceDetection = (props?: IFaceDetectionOptions): IFaceDetectionReturnType => {
  const {
    mirrored,
//     handleOnResults,
    faceDetectionOptions: options,
    faceDetection: faceDetectionInitializer,
    camera: cameraInitializer,
     } = props || ({} as IFaceDetectionOptions);
     
     const [isLoading, setIsLoading] = useState(true);

  /** Refs */
  const webcamRef = useRef<Webcam>(null);
  const camera = useRef(cameraInitializer).current;
  const faceDetection = useRef(faceDetectionInitializer).current;
  const faceDetectionOptions = useRef(options);

//   const onResults = useCallback(
//     (results: Results) => {
//       /** Callback to return detection results */
//       if (handleOnResults) handleOnResults(results);

//       const { detections } = results;

//       /** Set bounding box data */
      
//     },
//     [handleOnResults, mirrored],
//   );

  const handleFaceDetection = useCallback(
    async (mediaSrc: HTMLVideoElement | HTMLImageElement) => {
      /** Configure faceDetection usage/options */
      faceDetection.setOptions({ ...faceDetectionOptions.current });
     //  faceDetection.onResults(onResults);

      /** Handle webcam detection */
      if (mediaSrc instanceof HTMLVideoElement && camera) {
        const cameraConfig = {
          mediaSrc,
          width: mediaSrc.videoWidth,
          height: mediaSrc.videoHeight,
          onFrame: async () => {
            await faceDetection.send({ image: mediaSrc });
            if (isLoading) setIsLoading(false);
          },
        };

        camera(cameraConfig).start();
      }

      /** Handle image face detection */
     //  if (mediaSrc instanceof HTMLImageElement) {
     //    await faceDetection.send({ image: mediaSrc });
     //    if (isLoading) setIsLoading(false);
     //   }
    },
    [camera, faceDetection, isLoading,],
  );

  useEffect(() => {
    if (webcamRef.current && webcamRef.current.video) {
      handleFaceDetection(webcamRef.current.video);
    }

    
  }, [handleFaceDetection, isLoading,]);

  return {
    webcamRef
  };
};

export default useFaceDetection;