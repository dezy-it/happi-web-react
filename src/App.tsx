import UneeqProvider from "./context/UneeqProvider";
import DigitalHuman from "./DigitalHuman";

function App() {
    return (
        <UneeqProvider>
            <DigitalHuman />
        </UneeqProvider>
    );
}

export default App;
