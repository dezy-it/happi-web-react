import { useUneeq } from './context/UneeqProvider';
import { Box, Button } from 'rebass';

function DigitalHuman() {
    const { setAvatarVideoContainer, setLocalVideoContainer } = useUneeq();

    return (
        <>
            <Box style={{ height: "100vh", background: "transparent" }} ref={ref => setAvatarVideoContainer(ref)} />
            <Box style={{ display: "none" }} ref={ref => setLocalVideoContainer(ref)} />
        </>
    )
}

export default DigitalHuman