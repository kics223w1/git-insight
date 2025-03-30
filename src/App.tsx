import "./App.css";
import GitCommand from "./components/GitCommand";
import FileUpload from "./components/FileUpload";

function App() {
  return (
    <div className="landing-page">
      <div className="content">
        <h1>Insight your Repository</h1>
        <p className="tagline">
          Show beautiful charts and graphs from your git log output.txt file
        </p>

        <GitCommand />
        <FileUpload />
      </div>
    </div>
  );
}

export default App;
