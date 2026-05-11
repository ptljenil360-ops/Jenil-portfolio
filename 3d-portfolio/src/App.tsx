import { lazy, Suspense, useState } from "react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";
import VideoIntro from "./components/VideoIntro";

const App = () => {
  const [showText, setShowText] = useState(false);

  return (
    <>
      <LoadingProvider>
        <VideoIntro 
          onTextTrigger={() => setShowText(true)} 
          onTransition={() => {}} 
        />
        <Suspense>
          <MainContainer showText={showText}>
            <Suspense>
              <CharacterModel />
            </Suspense>
          </MainContainer>
        </Suspense>
      </LoadingProvider>
    </>
  );
};

export default App;

