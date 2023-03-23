import CallController from "./components/CallController";
import { useUneeq } from "./context/UneeqProvider";

function DigitalHuman() {
    const { setAvatarVideoContainer, setLocalVideoContainer } = useUneeq();

    return (
        <>
            <div style={{ position: "absolute", inset: 0 }}>
                <div
                    style={{ height: "100vh", background: "transparent" }}
                    ref={(ref) => setAvatarVideoContainer(ref)}
                />
                <div style={{ display: "none" }} ref={(ref) => setLocalVideoContainer(ref)} />
            </div>
            <CallController />
        </>
    );
}

export default DigitalHuman;
